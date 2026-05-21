const Role = require('../models/role.model');

const create = (data) => Role.create(data);

const findById = (id) => Role.findById(id).lean();

const findByName = (name) => Role.findOne({ name }).lean();

const findAll = (filter = {}) => Role.find(filter).sort({ name: 1 }).lean();

const update = (id, data) =>
  Role.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

const remove = (id) => Role.findByIdAndDelete(id);

const upsertByName = (name, data) =>
  Role.findOneAndUpdate(
    { name },
    { $set: data, $setOnInsert: { name } },
    { upsert: true, new: true, runValidators: true }
  );

module.exports = { create, findById, findByName, findAll, update, remove, upsertByName };
