const enquiryRepo = require('../repositories/enquiry.repository');
const ApiError = require('../../../utils/ApiError');
const { buildSkip } = require('../../../utils/pagination');
const { ENQUIRY_STATUS } = require('../../../constants/statuses');

const create = async (data, actor) => {
  const created = await enquiryRepo.create({ ...data, createdBy: actor._id });
  return created.toObject();
};

const list = async (query) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    source,
    temperature,
    createdBy,
    from,
    to,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};
  if (status) filter.status = Array.isArray(status) ? { $in: status } : status;
  if (source) filter.source = source;
  if (temperature) filter.temperature = temperature;
  if (createdBy) filter.createdBy = createdBy;
  if (query.assignedQualificationUser) {
    filter.assignedQualificationUser = query.assignedQualificationUser;
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (search) {
    const regex = { $regex: search, $options: 'i' };
    filter.$or = [
      { clientName: regex },
      { clientPhone: regex },
      { clientEmail: regex },
      { project: regex },
      { remarks: regex },
    ];
  }

  const skip = buildSkip({ page, limit });
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    enquiryRepo.findAll({ filter, sort, skip, limit: Number(limit) }),
    enquiryRepo.countAll(filter),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getById = async (id) => {
  const enquiry = await enquiryRepo.findById(id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  return enquiry;
};

const update = async (id, data, actor) => {
  const enquiry = await enquiryRepo.findById(id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  if ([ENQUIRY_STATUS.CONVERTED].includes(enquiry.status)) {
    throw ApiError.badRequest('Cannot edit a converted enquiry');
  }
  const updated = await enquiryRepo.update(id, { ...data, updatedBy: actor._id });
  return updated;
};

const setFollowup = async (id, nextFollowupAt, actor) => {
  const updated = await enquiryRepo.update(id, {
    nextFollowupAt: nextFollowupAt ? new Date(nextFollowupAt) : null,
    updatedBy: actor._id,
  });
  if (!updated) throw ApiError.notFound('Enquiry not found');
  return updated;
};

const remove = async (id) => {
  const enquiry = await enquiryRepo.findById(id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  if ([ENQUIRY_STATUS.QUALIFIED, ENQUIRY_STATUS.CONVERTED].includes(enquiry.status)) {
    throw ApiError.badRequest(`Cannot delete an enquiry in status: ${enquiry.status}`);
  }
  await enquiryRepo.remove(id);
};

const setStatus = (id, status, actor) => enquiryRepo.updateStatus(id, status, actor._id);

const assertExists = async (id) => {
  const ok = await enquiryRepo.existsById(id);
  if (!ok) throw ApiError.notFound('Enquiry not found');
};

module.exports = { create, list, getById, update, setFollowup, remove, setStatus, assertExists };
