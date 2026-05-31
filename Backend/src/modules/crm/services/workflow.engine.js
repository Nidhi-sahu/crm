const leadStageRepo = require('../repositories/leadStage.repository');
const leadRepo = require('../repositories/lead.repository');
const leadStageHistoryRepo = require('../repositories/leadStageHistory.repository');
const notificationService = require('./notification.service');
const auditLogService = require('./auditLog.service');
const ApiError = require('../../../utils/ApiError');
const ROLES = require('../../../constants/roles');
const { LEAD_TERMINAL_STATUSES } = require('../../../constants/statuses');
const { NOTIFICATION_TYPE } = require('../../../constants/notificationTypes');
const { REFERENCE_TYPE } = require('../../../constants/referenceTypes');
const stageAccessGuard = require('./stageAccessGuard');

const BYPASS_ROLES = [ROLES.ADMINISTRATOR];

const getRoleName = (user) => {
  if (!user || !user.roleId) return null;
  return typeof user.roleId === 'object' ? user.roleId.name : null;
};

const canMove = async (lead, toStageId, user) => {
  if (!lead) return { allowed: false, reason: 'Lead not found' };
  if (LEAD_TERMINAL_STATUSES.includes(lead.status)) {
    return { allowed: false, reason: `Lead is ${lead.status} — cannot move stage` };
  }

  const toStage = await leadStageRepo.findById(toStageId);
  if (!toStage) return { allowed: false, reason: 'Target stage not found' };
  if (!toStage.isActive) return { allowed: false, reason: 'Target stage is inactive' };

  const currentStageId = lead.currentStageId && (lead.currentStageId._id || lead.currentStageId);
  if (String(currentStageId) === String(toStageId)) {
    return { allowed: false, reason: 'Lead is already in this stage' };
  }

  const roleName = getRoleName(user);
  const isBypass = roleName && BYPASS_ROLES.includes(roleName);
  if (!isBypass && toStage.assignedRoles && toStage.assignedRoles.length > 0) {
    if (!roleName || !toStage.assignedRoles.includes(roleName)) {
      return { allowed: false, reason: `Role '${roleName || 'unknown'}' is not allowed for stage '${toStage.name}'` };
    }
  }

  if (!isBypass) {
    const access = stageAccessGuard.evaluateLeadAccess(user, lead, 'move stage', {
      targetStageOrder: toStage.order,
    });
    if (!access.allowed) {
      return { allowed: false, reason: access.reason };
    }
  }

  const currentStage = await leadStageRepo.findById(currentStageId);
  if (currentStage && currentStage.allowedNextStages && currentStage.allowedNextStages.length > 0) {
    const allowed = currentStage.allowedNextStages.map((s) => String(s));
    if (!allowed.includes(String(toStageId))) {
      return {
        allowed: false,
        reason: `Cannot transition from '${currentStage.name}' to '${toStage.name}'`,
      };
    }
  }

  // requiredFields check intentionally removed — stage moves are manual,
  // no field (budget/expectedRevenue) blocks a transition.

  return { allowed: true, toStage, currentStage };
};

const move = async (leadId, toStageId, { comment = '', plannedAt = null, attachments = [] }, user) => {
  const lead = await leadRepo.findById(leadId);
  if (!lead) throw ApiError.notFound('Lead not found');

  const check = await canMove(lead, toStageId, user);
  if (!check.allowed) throw ApiError.badRequest(check.reason);

  const { toStage, currentStage } = check;

  // Planned date for the new stage: use explicit value if provided,
  // otherwise auto-compute from the target stage's SLA (now + slaHours).
  const computedPlannedAt = plannedAt
    ? new Date(plannedAt)
    : toStage.slaHours
      ? new Date(Date.now() + toStage.slaHours * 60 * 60 * 1000)
      : null;

  await leadStageHistoryRepo.create({
    leadId: lead._id,
    fromStageId: currentStage ? currentStage._id : null,
    toStageId: toStage._id,
    fromStageName: currentStage ? currentStage.name : '',
    toStageName: toStage.name,
    movedBy: user._id,
    movedAt: new Date(),
    plannedAt: computedPlannedAt,
    actualAt: new Date(),
    comment,
    attachments,
    isUndo: false,
  });

  await leadRepo.moveStage(lead._id, {
    toStageId: toStage._id,
    actor: user,
    plannedAt: computedPlannedAt,
    actualAt: new Date(),
  });

  const assigneeId = lead.assignedTo && (lead.assignedTo._id || lead.assignedTo);
  if (assigneeId && String(assigneeId) !== String(user._id)) {
    await notificationService.notify({
      userId: assigneeId,
      type: NOTIFICATION_TYPE.LEAD_STAGE_MOVED,
      title: `Lead moved to ${toStage.name}`,
      body: currentStage ? `From ${currentStage.name} → ${toStage.name}` : `Moved to ${toStage.name}`,
      referenceType: REFERENCE_TYPE.LEAD,
      referenceId: lead._id,
      meta: { leadId: lead._id, fromStageId: currentStage && currentStage._id, toStageId: toStage._id, by: user._id },
    });
  }

  auditLogService.log({
    module: 'lead',
    action: 'stageMove',
    actor: user,
    refType: 'lead',
    refId: lead._id,
    oldData: { stageId: currentStage && currentStage._id, stageName: currentStage && currentStage.name },
    newData: { stageId: toStage._id, stageName: toStage.name },
    meta: { comment },
  });

  return leadRepo.findById(lead._id);
};

const undoLast = async (leadId, user) => {
  const lead = await leadRepo.findById(leadId);
  if (!lead) throw ApiError.notFound('Lead not found');
  if (LEAD_TERMINAL_STATUSES.includes(lead.status)) {
    throw ApiError.badRequest(`Lead is ${lead.status} — cannot undo stage`);
  }

  const access = stageAccessGuard.evaluateLeadAccess(user, lead, 'undo stage');
  if (!access.allowed) {
    throw ApiError.forbidden(access.reason);
  }

  // Revert = step back to the immediately previous stage (by order),
  // so "Undo Stage" always moves one stage back — never forward.
  const currentId = (lead.currentStageId && (lead.currentStageId._id || lead.currentStageId));
  const currentStage = await leadStageRepo.findById(currentId);
  if (!currentStage) throw ApiError.badRequest('Current stage not found');

  const stages = await leadStageRepo.findActive();
  const prevStage = stages
    .filter((s) => s.order < currentStage.order)
    .sort((a, b) => b.order - a.order)[0];
  if (!prevStage) {
    throw ApiError.badRequest('Lead is already at the first stage — cannot revert');
  }

  await leadStageHistoryRepo.create({
    leadId: lead._id,
    fromStageId: currentStage._id,
    toStageId: prevStage._id,
    fromStageName: currentStage.name,
    toStageName: prevStage.name,
    movedBy: user._id,
    movedAt: new Date(),
    actualAt: new Date(),
    comment: `Reverted from "${currentStage.name}" to "${prevStage.name}"`,
    isUndo: true,
  });

  await leadRepo.moveStage(lead._id, {
    toStageId: prevStage._id,
    actor: user,
    actualAt: new Date(),
  });

  auditLogService.log({
    module: 'lead',
    action: 'stageUndo',
    actor: user,
    refType: 'lead',
    refId: lead._id,
    oldData: { stageId: currentStage._id, stageName: currentStage.name },
    newData: { stageId: prevStage._id, stageName: prevStage.name },
  });

  return leadRepo.findById(lead._id);
};

// Admin-only: move a lead BACK from "Visit Confirmed" (stage 4) to any earlier
// telesales stage AND reassign telesales executive (#29). Reason mandatory.
const VISIT_CONFIRMED_ORDER = 4;

const moveBackFromVisit = async (
  leadId,
  { targetStageOrder, telesalesAssignedTo, reason },
  user,
) => {
  const lead = await leadRepo.findById(leadId);
  if (!lead) throw ApiError.notFound('Lead not found');
  if (LEAD_TERMINAL_STATUSES.includes(lead.status)) {
    throw ApiError.badRequest(`Lead is ${lead.status} — cannot move`);
  }

  const currentStage = lead.currentStageId;
  if (!currentStage || currentStage.order !== VISIT_CONFIRMED_ORDER) {
    throw ApiError.badRequest(
      'This action is only allowed when the lead is at Visit Confirmed stage',
    );
  }

  if (!reason || String(reason).trim().length < 15) {
    throw ApiError.badRequest(
      'Reason is mandatory for moving the lead back (min 15 characters)',
    );
  }
  if (!targetStageOrder || Number(targetStageOrder) >= VISIT_CONFIRMED_ORDER) {
    throw ApiError.badRequest('Select a stage earlier than Visit Confirmed');
  }
  if (!telesalesAssignedTo) {
    throw ApiError.badRequest('Telesales executive selection is mandatory');
  }

  const stages = await leadStageRepo.findActive();
  const targetStage = stages.find((s) => s.order === Number(targetStageOrder));
  if (!targetStage) throw ApiError.badRequest('Target stage not found');

  await leadStageHistoryRepo.create({
    leadId: lead._id,
    fromStageId: currentStage._id,
    toStageId: targetStage._id,
    fromStageName: currentStage.name,
    toStageName: targetStage.name,
    movedBy: user._id,
    movedAt: new Date(),
    actualAt: new Date(),
    comment: `Moved back to telesales — ${String(reason).trim()}`,
    isUndo: true,
  });

  await leadRepo.moveStage(lead._id, {
    toStageId: targetStage._id,
    actor: user,
    actualAt: new Date(),
  });

  // Reassign enquiry telesales executive
  const enquiryRepo = require('../repositories/enquiry.repository');
  await enquiryRepo.update(lead.enquiryId._id || lead.enquiryId, {
    assignedTo: telesalesAssignedTo,
    updatedBy: user._id,
  });

  auditLogService.log({
    module: 'lead',
    action: 'moveBackFromVisit',
    actor: user,
    refType: 'lead',
    refId: lead._id,
    oldData: { stageId: currentStage._id, stageName: currentStage.name },
    newData: {
      stageId: targetStage._id,
      stageName: targetStage.name,
      telesalesAssignedTo,
    },
    meta: { reason: String(reason).trim() },
  });

  return leadRepo.findById(lead._id);
};

module.exports = { canMove, move, undoLast, moveBackFromVisit };
