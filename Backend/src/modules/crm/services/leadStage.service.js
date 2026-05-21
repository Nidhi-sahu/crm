const leadStageRepo = require('../repositories/leadStage.repository');
const leadRepo = require('../repositories/lead.repository');
const ApiError = require('../../../utils/ApiError');

const validateAllowedNextStages = async (ids = []) => {
  if (!ids.length) return;
  const stages = await leadStageRepo.findAll({ _id: { $in: ids } });
  if (stages.length !== ids.length) {
    throw ApiError.badRequest('One or more allowedNextStages ids are invalid');
  }
};

const ensureSingleInitial = async (excludeId = null) => {
  const all = await leadStageRepo.findAll({ isInitial: true });
  const others = excludeId ? all.filter((s) => String(s._id) !== String(excludeId)) : all;
  if (others.length > 0) {
    throw ApiError.conflict('Another stage is already marked as initial');
  }
};

const create = async (data) => {
  if (data.isInitial) await ensureSingleInitial();
  await validateAllowedNextStages(data.allowedNextStages);

  const existingName = await leadStageRepo.findByName(data.name);
  if (existingName) throw ApiError.conflict('Stage name already exists');

  const all = await leadStageRepo.findAll();
  const orderTaken = all.find((s) => s.order === data.order);
  if (orderTaken) throw ApiError.conflict(`Order ${data.order} is already used by '${orderTaken.name}'`);

  return leadStageRepo.create(data);
};

const list = (filter = {}) => leadStageRepo.findAll(filter);

const getById = async (id) => {
  const stage = await leadStageRepo.findById(id);
  if (!stage) throw ApiError.notFound('Stage not found');
  return stage;
};

const update = async (id, data) => {
  const stage = await leadStageRepo.findById(id);
  if (!stage) throw ApiError.notFound('Stage not found');

  if (data.isInitial && !stage.isInitial) await ensureSingleInitial(id);
  if (data.allowedNextStages) await validateAllowedNextStages(data.allowedNextStages);

  if (data.name && data.name !== stage.name) {
    const dup = await leadStageRepo.findByName(data.name);
    if (dup) throw ApiError.conflict('Stage name already exists');
  }

  if (data.order && data.order !== stage.order) {
    const orderTaken = (await leadStageRepo.findAll({ order: data.order })).find(
      (s) => String(s._id) !== String(id)
    );
    if (orderTaken) throw ApiError.conflict(`Order ${data.order} is already used by '${orderTaken.name}'`);
  }

  if (stage.isSystem && data.name && data.name !== stage.name) {
    throw ApiError.forbidden('Cannot rename a system stage');
  }

  return leadStageRepo.update(id, data);
};

const reorder = async (items) => {
  const orders = items.map((i) => i.order);
  if (new Set(orders).size !== orders.length) {
    throw ApiError.badRequest('Duplicate order values in payload');
  }
  await leadStageRepo.bulkReorder(items);
  return leadStageRepo.findAll();
};

// Bulk "Save All Steps" — syncs the full ordered list in one shot.
// Admin config tool: bypasses isSystem rename/delete protection.
// A removed stage that still has leads is kept (not deleted) and reported.
const bulkSync = async (steps) => {
  const existing = await leadStageRepo.findAll();
  const incomingIds = new Set(steps.filter((s) => s.id).map((s) => String(s.id)));

  // 1. Figure out deletions — skip stages that still hold leads
  const skipped = [];
  const removableIds = [];
  for (const stage of existing) {
    if (incomingIds.has(String(stage._id))) continue;
    // eslint-disable-next-line no-await-in-loop
    const count = await leadRepo.countInStage(stage._id);
    if (count > 0) skipped.push({ id: stage._id, name: stage.name });
    else removableIds.push(stage._id);
  }
  for (const id of removableIds) {
    // eslint-disable-next-line no-await-in-loop
    await leadStageRepo.remove(id);
  }

  // 2. Park every surviving stage on a unique temp name + order so the
  //    final assignment never collides with the unique indexes.
  const survivors = await leadStageRepo.findAll();
  for (let i = 0; i < survivors.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await leadStageRepo.update(survivors[i]._id, {
      name: `__sync_tmp_${i}_${survivors[i]._id}`,
      order: 100000 + i,
    });
  }

  const keptIds = new Set(
    existing.filter((s) => incomingIds.has(String(s._id))).map((s) => String(s._id)),
  );

  // 3. Apply the final ordered list
  const total = steps.length;
  for (let i = 0; i < total; i += 1) {
    const step = steps[i];
    const base = {
      name: step.name.trim(),
      order: i + 1,
      isInitial: i === 0,
      isFinal: i === total - 1,
      isActive: true,
    };
    if (step.id && keptIds.has(String(step.id))) {
      // eslint-disable-next-line no-await-in-loop
      await leadStageRepo.update(step.id, base);
    } else {
      // eslint-disable-next-line no-await-in-loop
      await leadStageRepo.create({
        ...base,
        color: '#BEE1FF',
        description: '',
        assignedRoles: [],
        requiredFields: [],
        allowedNextStages: [],
        slaHours: 24,
        isSystem: false,
      });
    }
  }

  // 4. Restore skipped (lead-holding) stages after the clean range
  for (let i = 0; i < skipped.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await leadStageRepo.update(skipped[i].id, {
      name: skipped[i].name,
      order: total + 1 + i,
      isInitial: false,
      isFinal: false,
    });
  }

  const stages = await leadStageRepo.findAll();
  return { stages, skipped: skipped.map((s) => s.name) };
};

const activate = (id) => leadStageRepo.update(id, { isActive: true });
const deactivate = async (id) => {
  const count = await leadRepo.countInStage(id);
  if (count > 0) throw ApiError.badRequest(`Cannot deactivate — ${count} active lead(s) currently in this stage`);
  return leadStageRepo.update(id, { isActive: false });
};

const remove = async (id) => {
  const stage = await leadStageRepo.findById(id);
  if (!stage) throw ApiError.notFound('Stage not found');
  if (stage.isSystem) throw ApiError.forbidden('Cannot delete a system stage');
  const count = await leadRepo.countInStage(id);
  if (count > 0) throw ApiError.badRequest(`Cannot delete — ${count} lead(s) currently in this stage`);
  await leadStageRepo.remove(id);
};

module.exports = {
  create,
  list,
  getById,
  update,
  reorder,
  bulkSync,
  activate,
  deactivate,
  remove,
};
