import { projectsAPI } from './projectsAPI';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;
const toArray = (data) =>
  Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
const extractProject = (data) => data?.project ?? data ?? null;

export const projectsService = {
  async list(params = {}) {
    return toArray(unwrap(await projectsAPI.list(params)));
  },
  async create(payload) {
    return extractProject(unwrap(await projectsAPI.create(payload)));
  },
  async update(id, payload) {
    return extractProject(unwrap(await projectsAPI.update(id, payload)));
  },
  async remove(id) {
    return unwrap(await projectsAPI.remove(id));
  },
};
