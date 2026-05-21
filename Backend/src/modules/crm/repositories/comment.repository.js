const Comment = require('../models/comment.model');

const create = (data) => Comment.create(data);

const findById = (id) =>
  Comment.findById(id).populate({ path: 'createdBy', select: 'name email' }).lean();

const findByRef = (referenceType, referenceId, { limit = 100 } = {}) =>
  Comment.find({ referenceType, referenceId })
    .populate({ path: 'createdBy', select: 'name email' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

const findAll = ({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 20 }) =>
  Comment.find(filter)
    .populate({ path: 'createdBy', select: 'name email' })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

const countAll = (filter = {}) => Comment.countDocuments(filter);

const remove = (id) => Comment.findByIdAndDelete(id);

module.exports = { create, findById, findByRef, findAll, countAll, remove };
