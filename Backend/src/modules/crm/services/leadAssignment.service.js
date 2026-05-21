const leadRepo = require('../repositories/lead.repository');
const leadAssignmentRepo = require('../repositories/leadAssignment.repository');
const userRepo = require('../repositories/user.repository');
const roleRepo = require('../repositories/role.repository');
const notificationService = require('./notification.service');
const auditLogService = require('./auditLog.service');
const ApiError = require('../../../utils/ApiError');
const { buildSkip } = require('../../../utils/pagination');
const { ASSIGNMENT_TRIGGER } = require('../../../constants/assignmentTriggers');
const { LEAD_TERMINAL_STATUSES } = require('../../../constants/statuses');
const { NOTIFICATION_TYPE } = require('../../../constants/notificationTypes');
const { REFERENCE_TYPE } = require('../../../constants/referenceTypes');
const config = require('../../../config');
const logger = require('../../../utils/logger');

const assertAssignable = (lead) => {
  if (!lead) throw ApiError.notFound('Lead not found');
  if (LEAD_TERMINAL_STATUSES.includes(lead.status)) {
    throw ApiError.badRequest(`Lead is ${lead.status} — cannot reassign`);
  }
};

const recordAssignment = ({ leadId, assignedTo, assignedBy, previousAssignee, autoAssigned, triggerType, reason }) =>
  leadAssignmentRepo.create({
    leadId,
    assignedTo,
    assignedBy: assignedBy || null,
    previousAssignee: previousAssignee || null,
    assignedAt: new Date(),
    autoAssigned: !!autoAssigned,
    triggerType,
    assignmentReason: reason || '',
  });

const assign = async (leadId, { assignedTo, reason }, actor) => {
  const lead = await leadRepo.findById(leadId);
  assertAssignable(lead);

  const assignee = await userRepo.findById(assignedTo);
  if (!assignee) throw ApiError.badRequest('Assignee not found');
  if (assignee.status !== 'active') throw ApiError.badRequest('Assignee is not active');

  const currentAssigneeId =
    lead.assignedTo && (lead.assignedTo._id || lead.assignedTo);
  if (currentAssigneeId && String(currentAssigneeId) === String(assignedTo)) {
    throw ApiError.badRequest('Lead is already assigned to this user');
  }

  const triggerType = currentAssigneeId ? ASSIGNMENT_TRIGGER.REASSIGN : ASSIGNMENT_TRIGGER.MANUAL;

  await leadRepo.setAssignment(leadId, { assignedTo, actor });
  await recordAssignment({
    leadId,
    assignedTo,
    assignedBy: actor._id,
    previousAssignee: currentAssigneeId,
    autoAssigned: false,
    triggerType,
    reason,
  });

  await notificationService.notify({
    userId: assignedTo,
    type: triggerType === ASSIGNMENT_TRIGGER.REASSIGN
      ? NOTIFICATION_TYPE.LEAD_REASSIGNED
      : NOTIFICATION_TYPE.LEAD_ASSIGNED,
    title: triggerType === ASSIGNMENT_TRIGGER.REASSIGN ? 'Lead reassigned to you' : 'New lead assigned to you',
    body: reason || `Lead ${leadId}`,
    referenceType: REFERENCE_TYPE.LEAD,
    referenceId: leadId,
    meta: { leadId, assignedBy: actor._id, previousAssignee: currentAssigneeId },
  });

  auditLogService.log({
    module: 'leadAssignment',
    action: triggerType,
    actor,
    refType: 'lead',
    refId: leadId,
    oldData: { assignedTo: currentAssigneeId },
    newData: { assignedTo, reason },
  });

  return leadRepo.findById(leadId);
};

const unassign = async (leadId, { reason }, actor) => {
  const lead = await leadRepo.findById(leadId);
  assertAssignable(lead);

  const currentAssigneeId = lead.assignedTo && (lead.assignedTo._id || lead.assignedTo);
  if (!currentAssigneeId) throw ApiError.badRequest('Lead is not assigned to anyone');

  await leadRepo.setAssignment(leadId, { assignedTo: null, actor });
  await recordAssignment({
    leadId,
    assignedTo: null,
    assignedBy: actor._id,
    previousAssignee: currentAssigneeId,
    autoAssigned: false,
    triggerType: ASSIGNMENT_TRIGGER.UNASSIGN,
    reason,
  });

  auditLogService.log({
    module: 'leadAssignment',
    action: 'unassign',
    actor,
    refType: 'lead',
    refId: leadId,
    oldData: { assignedTo: currentAssigneeId },
    newData: { assignedTo: null, reason },
  });

  return leadRepo.findById(leadId);
};

const pickLeastLoadedAssignee = async (targetRoleName) => {
  const role = await roleRepo.findByName(targetRoleName);
  if (!role) {
    logger.warn(`Auto-assign target role not found: ${targetRoleName}`);
    return null;
  }
  const candidates = await userRepo.findActiveByRoleId(role._id);
  if (!candidates.length) {
    logger.warn(`No active users in target role: ${targetRoleName}`);
    return null;
  }

  const ids = candidates.map((u) => u._id);
  const workloads = await leadRepo.getWorkloadByUserIds(ids);
  const countByUser = Object.fromEntries(workloads.map((w) => [String(w._id), w.count]));

  return candidates
    .map((u) => ({ user: u, count: countByUser[String(u._id)] || 0 }))
    .sort((a, b) => a.count - b.count || String(a.user._id).localeCompare(String(b.user._id)))[0];
};

const autoAssignOne = async (lead) => {
  const targetRole = config.cron.autoAssignTargetRole;
  const pick = await pickLeastLoadedAssignee(targetRole);
  if (!pick) return { assignedTo: null, reason: `No candidate in role '${targetRole}'` };

  const claimed = await leadRepo.claimForAssignment(lead._id, pick.user._id);
  if (!claimed) {
    return { assignedTo: null, reason: 'Lead was already assigned by another process' };
  }

  const reason = `Auto-assigned: least loaded in '${targetRole}' (${pick.count} active leads)`;

  await recordAssignment({
    leadId: lead._id,
    assignedTo: pick.user._id,
    assignedBy: null,
    previousAssignee: null,
    autoAssigned: true,
    triggerType: ASSIGNMENT_TRIGGER.AUTO,
    reason,
  });

  await notificationService.notify({
    userId: pick.user._id,
    type: NOTIFICATION_TYPE.LEAD_AUTO_ASSIGNED,
    title: 'Lead auto-assigned to you',
    body: reason,
    referenceType: REFERENCE_TYPE.LEAD,
    referenceId: lead._id,
    meta: { leadId: lead._id, workload: pick.count },
  });

  return {
    assignedTo: pick.user._id,
    assigneeName: pick.user.name,
    workload: pick.count,
  };
};

const runAutoAssignSweep = async ({ delayMinutes, batchSize } = {}) => {
  const minutes = typeof delayMinutes === 'number' ? delayMinutes : config.cron.autoAssignDelayMinutes;
  const size = typeof batchSize === 'number' ? batchSize : config.cron.autoAssignBatchSize;
  const threshold = new Date(Date.now() - minutes * 60 * 1000);

  const candidates = await leadRepo.findUnassignedOlderThan(threshold, size);

  const results = { scanned: candidates.length, assigned: 0, skipped: 0, details: [] };

  for (const lead of candidates) {
    try {
      const res = await autoAssignOne(lead);
      if (res.assignedTo) {
        results.assigned += 1;
        results.details.push({ leadId: lead._id, assignee: res.assigneeName, workload: res.workload });
      } else {
        results.skipped += 1;
        results.details.push({ leadId: lead._id, reason: res.reason });
      }
    } catch (err) {
      results.skipped += 1;
      results.details.push({ leadId: lead._id, error: err && err.message });
      logger.warn('Auto-assign failed for lead', { leadId: lead._id, err: err && err.message });
    }
  }

  return results;
};

const getHistoryForLead = (leadId) => leadAssignmentRepo.findByLeadId(leadId);

const list = async (query) => {
  const {
    page = 1,
    limit = 20,
    leadId,
    assignedTo,
    assignedBy,
    autoAssigned,
    triggerType,
    from,
    to,
  } = query;

  const filter = {};
  if (leadId) filter.leadId = leadId;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (assignedBy) filter.assignedBy = assignedBy;
  if (autoAssigned !== undefined) filter.autoAssigned = autoAssigned;
  if (triggerType) filter.triggerType = triggerType;
  if (from || to) {
    filter.assignedAt = {};
    if (from) filter.assignedAt.$gte = new Date(from);
    if (to) filter.assignedAt.$lte = new Date(to);
  }

  const skip = buildSkip({ page, limit });
  const [items, total] = await Promise.all([
    leadAssignmentRepo.findAll({ filter, skip, limit: Number(limit) }),
    leadAssignmentRepo.countAll(filter),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

module.exports = {
  assign,
  unassign,
  autoAssignOne,
  runAutoAssignSweep,
  getHistoryForLead,
  list,
};
