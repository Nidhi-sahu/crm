const projectRepo = require('../repositories/project.repository');
const ApiError = require('../../../utils/ApiError');

const list = (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.isActive !== undefined) filter.isActive = query.isActive;
  return projectRepo.findAll(filter);
};

const create = async (data, actor) => {
  if (await projectRepo.existsByName(data.name)) {
    throw ApiError.conflict('A project with this name already exists');
  }
  const created = await projectRepo.create({ ...data, createdBy: actor._id });
  return created.toObject();
};

const update = async (id, data, actor) => {
  const existing = await projectRepo.findById(id);
  if (!existing) throw ApiError.notFound('Project not found');
  if (data.name && (await projectRepo.existsByName(data.name, id))) {
    throw ApiError.conflict('A project with this name already exists');
  }
  return projectRepo.update(id, { ...data, updatedBy: actor._id });
};

const remove = async (id) => {
  const existing = await projectRepo.findById(id);
  if (!existing) throw ApiError.notFound('Project not found');
  await projectRepo.remove(id);
};

module.exports = { list, create, update, remove };
