const Qualification = require('../models/qualification.model');

const create = (data) => Qualification.create(data);

const findById = (id) =>
  Qualification.findById(id)
    .populate({ path: 'enquiryId' })
    .populate({ path: 'qualifiedBy', select: 'name email' })
    .populate({ path: 'createdBy', select: 'name email' })
    .lean();

const findByEnquiryId = (enquiryId) =>
  Qualification.findOne({ enquiryId })
    .populate({ path: 'qualifiedBy', select: 'name email' })
    .populate({ path: 'createdBy', select: 'name email' })
    .lean();

const findAll = ({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 20 }) =>
  Qualification.find(filter)
    .populate({ path: 'enquiryId', select: 'clientName clientPhone status temperature' })
    .populate({ path: 'qualifiedBy', select: 'name email' })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

const countAll = (filter = {}) => Qualification.countDocuments(filter);

const update = (id, data) =>
  Qualification.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate({ path: 'enquiryId' })
    .populate({ path: 'qualifiedBy', select: 'name email' })
    .lean();

const remove = (id) => Qualification.findByIdAndDelete(id);

module.exports = {
  create,
  findById,
  findByEnquiryId,
  findAll,
  countAll,
  update,
  remove,
};
