const Enquiry = require('../models/enquiry.model');

const POPULATE_USER = { select: 'name email' };

const create = (data) => Enquiry.create(data);

const findById = (id) =>
  Enquiry.findById(id)
    .populate({ path: 'createdBy', ...POPULATE_USER })
    .populate({ path: 'updatedBy', ...POPULATE_USER })
    .populate({ path: 'assignedQualificationUser', ...POPULATE_USER })
    .lean();

const findAll = ({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 20 }) =>
  Enquiry.find(filter)
    .populate({ path: 'createdBy', ...POPULATE_USER })
    .populate({ path: 'assignedQualificationUser', ...POPULATE_USER })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

const countAll = (filter = {}) => Enquiry.countDocuments(filter);

const update = (id, data) =>
  Enquiry.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate({ path: 'createdBy', ...POPULATE_USER })
    .populate({ path: 'assignedQualificationUser', ...POPULATE_USER })
    .lean();

const updateStatus = (id, status, updatedBy) =>
  Enquiry.findByIdAndUpdate(
    id,
    { $set: { status, updatedBy } },
    { new: true, runValidators: true }
  );

const remove = (id) => Enquiry.findByIdAndDelete(id);

const existsById = async (id) => {
  const doc = await Enquiry.exists({ _id: id });
  return !!doc;
};

const searchIds = async (term) => {
  const regex = { $regex: term, $options: 'i' };
  const docs = await Enquiry.find({
    $or: [
      { clientName: regex },
      { clientPhone: regex },
      { clientEmail: regex },
      { companyName: regex },
    ],
  })
    .select('_id')
    .lean();
  return docs.map((d) => d._id);
};

module.exports = {
  create,
  findById,
  findAll,
  countAll,
  update,
  updateStatus,
  remove,
  existsById,
  searchIds,
};
