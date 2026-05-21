const Configuration = require('../models/configuration.model');

const create = (data) => Configuration.create(data);

const findByKey = (key) => Configuration.findOne({ key }).lean();

const findAll = (filter = {}) => Configuration.find(filter).sort({ category: 1, key: 1 }).lean();

const upsertByKey = (key, data) =>
  Configuration.findOneAndUpdate(
    { key },
    { $set: data, $setOnInsert: { key } },
    { upsert: true, new: true, runValidators: true }
  ).lean();

const remove = (key) => Configuration.findOneAndDelete({ key });

const bulkUpsert = async (items, actor) => {
  const ops = items.map((i) => ({
    updateOne: {
      filter: { key: i.key },
      update: {
        $set: {
          value: i.value,
          category: i.category || 'general',
          description: i.description || '',
          updatedBy: actor && actor._id,
        },
        $setOnInsert: { key: i.key },
      },
      upsert: true,
    },
  }));
  return Configuration.bulkWrite(ops, { ordered: false });
};

module.exports = { create, findByKey, findAll, upsertByKey, remove, bulkUpsert };
