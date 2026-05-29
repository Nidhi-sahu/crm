const Project = require('../models/project.model');

const create = (data) => Project.create(data);

const findAll = (filter = {}) =>
  Project.find(filter)
    .populate({ path: 'createdBy', select: 'name email' })
    .sort({ createdAt: -1 })
    .lean();

const findById = (id) => Project.findById(id).lean();

const update = (id, data) =>
  Project.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

const remove = (id) => Project.findByIdAndDelete(id);

const existsByName = async (name, excludeId = null) => {
  if (!name) return false;
  const filter = { name: new RegExp(`^${String(name).trim()}$`, 'i') };
  if (excludeId) filter._id = { $ne: excludeId };
  const doc = await Project.exists(filter);
  return !!doc;
};

module.exports = { create, findAll, findById, update, remove, existsByName };
