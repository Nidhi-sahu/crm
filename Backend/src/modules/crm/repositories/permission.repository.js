const Permission = require('../models/permission.model');

const create = (data) => Permission.create(data);

const upsertMany = (items) => {
  const ops = items.map((p) => ({
    updateOne: {
      filter: { key: p.key },
      update: { $set: p },
      upsert: true,
    },
  }));
  return Permission.bulkWrite(ops);
};

const findAll = (filter = {}) =>
  Permission.find(filter).sort({ module: 1, action: 1 }).lean();

const findByKey = (key) => Permission.findOne({ key }).lean();

const findKeys = async (keys) => {
  if (!keys || !keys.length) return [];
  const docs = await Permission.find({ key: { $in: keys } }, { key: 1 }).lean();
  return docs.map((d) => d.key);
};

module.exports = { create, upsertMany, findAll, findByKey, findKeys };
