const LeadStage = require('../models/leadStage.model');

const create = (data) => LeadStage.create(data);

const findById = (id) => LeadStage.findById(id).lean();

const findByName = (name) => LeadStage.findOne({ name }).lean();

const findAll = (filter = {}) => LeadStage.find(filter).sort({ order: 1 }).lean();

const findActive = () => LeadStage.find({ isActive: true }).sort({ order: 1 }).lean();

const findInitial = () =>
  LeadStage.findOne({ isInitial: true, isActive: true }).sort({ order: 1 }).lean();

const findFirstActive = () => LeadStage.findOne({ isActive: true }).sort({ order: 1 }).lean();

const update = (id, data) =>
  LeadStage.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

const remove = (id) => LeadStage.findByIdAndDelete(id);

const upsertByName = (name, data) =>
  LeadStage.findOneAndUpdate(
    { name },
    { $set: data, $setOnInsert: { name } },
    { upsert: true, new: true, runValidators: true }
  );

const upsertByOrder = (order, data) =>
  LeadStage.findOneAndUpdate(
    { order },
    { $set: data },
    { upsert: true, new: true, runValidators: true }
  );

const bulkReorder = async (items) => {
  const ops = items.map(({ id, order }) => ({
    updateOne: { filter: { _id: id }, update: { $set: { order } } },
  }));
  return LeadStage.bulkWrite(ops, { ordered: false });
};

module.exports = {
  create,
  findById,
  findByName,
  findAll,
  findActive,
  findInitial,
  findFirstActive,
  update,
  remove,
  upsertByName,
  upsertByOrder,
  bulkReorder,
};
