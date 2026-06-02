const callLogRepo = require('../repositories/callLog.repository');
const leadRepo = require('../repositories/lead.repository');
const ApiError = require('../../../utils/ApiError');

const create = async (leadId, data, actor) => {
  const lead = await leadRepo.findById(leadId);
  if (!lead) throw ApiError.notFound('Lead not found');

  const enquiry = lead.enquiryId || {};
  const created = await callLogRepo.create({
    leadId,
    enquiryId: enquiry._id || lead.enquiryId || null,
    calledBy: actor._id,
    phoneNumber: (data.phoneNumber || enquiry.clientPhone || '').trim(),
    direction: data.direction || 'outbound',
    outcome: data.outcome || 'connected',
    durationSeconds: Number(data.durationSeconds) || 0,
    stageName: data.stageName || (lead.currentStageId && lead.currentStageId.name) || '',
    notes: (data.notes || '').trim(),
    calledAt: data.calledAt ? new Date(data.calledAt) : new Date(),
    provider: 'manual',
  });

  // Keep the lead's activity timestamp fresh so it surfaces in follow-up views.
  await leadRepo.update(leadId, { lastActivityAt: new Date() });

  return created.toObject();
};

const listForLead = (leadId) => callLogRepo.findByLeadId(leadId);

module.exports = { create, listForLead };
