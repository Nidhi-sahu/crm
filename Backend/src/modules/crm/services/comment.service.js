const commentRepo = require('../repositories/comment.repository');
const enquiryRepo = require('../repositories/enquiry.repository');
const leadRepo = require('../repositories/lead.repository');
const qualificationRepo = require('../repositories/qualification.repository');
const ApiError = require('../../../utils/ApiError');
const { buildSkip } = require('../../../utils/pagination');
const { REFERENCE_TYPE } = require('../../../constants/referenceTypes');
const stageAccessGuard = require('./stageAccessGuard');

const assertReferenceExists = async (referenceType, referenceId) => {
  let exists = false;
  if (referenceType === REFERENCE_TYPE.ENQUIRY) {
    exists = await enquiryRepo.existsById(referenceId);
  } else if (referenceType === REFERENCE_TYPE.LEAD) {
    const l = await leadRepo.findById(referenceId);
    exists = !!l;
  } else if (referenceType === REFERENCE_TYPE.QUALIFICATION) {
    const q = await qualificationRepo.findById(referenceId);
    exists = !!q;
  }
  if (!exists) throw ApiError.badRequest(`${referenceType} not found: ${referenceId}`);
};

const create = async (data, actor) => {
  if (data.referenceType === REFERENCE_TYPE.LEAD) {
    const lead = await leadRepo.findById(data.referenceId);
    if (!lead) throw ApiError.badRequest(`${data.referenceType} not found: ${data.referenceId}`);
    stageAccessGuard.assertLeadAccess(actor, lead, 'comment');
  } else {
    await assertReferenceExists(data.referenceType, data.referenceId);
  }
  const created = await commentRepo.create({
    referenceType: data.referenceType,
    referenceId: data.referenceId,
    comment: data.comment,
    nextFollowupDate: data.nextFollowupDate ? new Date(data.nextFollowupDate) : null,
    nextFollowupTime: data.nextFollowupTime || '',
    createdBy: actor._id,
  });
  return created.toObject();
};

const list = async (query) => {
  const { page = 1, limit = 20, referenceType, referenceId, createdBy, from, to } = query;
  const filter = {};
  if (referenceType) filter.referenceType = referenceType;
  if (referenceId) filter.referenceId = referenceId;
  if (createdBy) filter.createdBy = createdBy;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  const skip = buildSkip({ page, limit });
  const [items, total] = await Promise.all([
    commentRepo.findAll({ filter, skip, limit: Number(limit) }),
    commentRepo.countAll(filter),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

const getById = async (id) => {
  const c = await commentRepo.findById(id);
  if (!c) throw ApiError.notFound('Comment not found');
  return c;
};

const getByRef = async (referenceType, referenceId) => {
  await assertReferenceExists(referenceType, referenceId);
  return commentRepo.findByRef(referenceType, referenceId);
};

const remove = async (id, actor) => {
  const c = await commentRepo.findById(id);
  if (!c) throw ApiError.notFound('Comment not found');
  const isAdmin = actor.roleId && actor.roleId.name === 'Administrator';
  if (!isAdmin && String(c.createdBy._id || c.createdBy) !== String(actor._id)) {
    throw ApiError.forbidden('Only the author or an administrator can delete this comment');
  }
  await commentRepo.remove(id);
};

module.exports = { create, list, getById, getByRef, remove };
