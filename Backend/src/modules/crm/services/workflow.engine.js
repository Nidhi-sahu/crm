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

  const last = await leadStageHistoryRepo.findLastForLead(leadId);
  if (!last) throw ApiError.badRequest('No stage history to undo');
  if (!last.fromStageId) throw ApiError.badRequest('Cannot undo the initial stage');

  const fromStage = last.fromStageId;
  const toStage = last.toStageId;

  await leadStageHistoryRepo.create({
    leadId: lead._id,
    fromStageId: toStage && toStage._id,
    toStageId: fromStage && fromStage._id,
    fromStageName: toStage ? toStage.name : '',
    toStageName: fromStage ? fromStage.name : '',
    movedBy: user._id,
    movedAt: new Date(),
    actualAt: new Date(),
    comment: `Undo of move to "${toStage ? toStage.name : 'unknown'}"`,
    isUndo: true,
    undoneEntryId: last._id,
  });

  await leadRepo.moveStage(lead._id, {
    toStageId: fromStage._id,
    actor: user,
    actualAt: new Date(),
  });

  auditLogService.log({
    module: 'lead',
    action: 'stageUndo',
    actor: user,
    refType: 'lead',
    refId: lead._id,
    oldData: { stageId: toStage && toStage._id, stageName: toStage && toStage.name },
    newData: { stageId: fromStage._id, stageName: fromStage.name },
  });

  return leadRepo.findById(lead._id);
};

module.exports = { canMove, move, undoLast };
