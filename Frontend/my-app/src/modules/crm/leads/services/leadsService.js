import { leadsAPI } from './leadsAPI';
import { leadStagesAPI } from './leadStagesAPI';
import { leadCommentsAPI } from './leadCommentsAPI';
import { rolesAPI } from '../../roles/services/rolesAPI';
import { usersAPI } from '../../users/services/usersAPI';
import { uiStatusToBackend } from '../constants/leadStatuses';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;
const meta = (res) => res?.data?.meta ?? null;

const cleanParams = (params = {}) => {
  const out = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === '' || v === null || v === undefined) return;
    out[k] = v;
  });
  return out;
};

const extractLead = (data) => data?.lead ?? data ?? null;

export const leadsService = {
  async list(params = {}) {
    const p = { ...params };
    if (p.uiStatus) {
      const backend = uiStatusToBackend(p.uiStatus);
      if (backend) p.status = backend;
    }
    delete p.uiStatus;
    const res = await leadsAPI.list(cleanParams(p));
    const data = unwrap(res);
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    const pagination =
      meta(res)?.pagination ||
      (data?.total !== undefined
        ? {
            page: data.page || 1,
            limit: data.limit || p.limit || 10,
            total: data.total || 0,
            totalPages: Math.max(1, Math.ceil((data.total || 0) / (data.limit || 10))),
          }
        : { page: 1, limit: p.limit || 10, total: items.length, totalPages: 1 });
    return { items, pagination };
  },

  async getById(id) {
    return extractLead(unwrap(await leadsAPI.getById(id)));
  },

  async getHistory(id) {
    const data = unwrap(await leadsAPI.history(id));
    return Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  },

  async update(id, payload) {
    return extractLead(unwrap(await leadsAPI.update(id, payload)));
  },

  async moveStage(id, payload) {
    return extractLead(unwrap(await leadsAPI.moveStage(id, payload)));
  },

  async undoStage(id) {
    return extractLead(unwrap(await leadsAPI.undoStage(id)));
  },

  async markWon(id) {
    return extractLead(unwrap(await leadsAPI.markWon(id)));
  },

  async markDropped(id, reason) {
    return extractLead(unwrap(await leadsAPI.markDropped(id, reason)));
  },

  async assignVisit(id, visitAssignedTo) {
    return extractLead(unwrap(await leadsAPI.assignVisit(id, { visitAssignedTo })));
  },

  async unassignVisit(id, reason) {
    return extractLead(unwrap(await leadsAPI.unassignVisit(id, { reason })));
  },

  async listVisitTeamMembers() {
    const rolesData = unwrap(await rolesAPI.list());
    const roles = Array.isArray(rolesData?.items)
      ? rolesData.items
      : Array.isArray(rolesData)
      ? rolesData
      : [];
    const visitTeamRole = roles.find((r) => r.name === 'Visit Team');
    if (!visitTeamRole) return [];

    const usersData = unwrap(await usersAPI.list({ roleId: visitTeamRole._id, limit: 100 }));
    return Array.isArray(usersData?.items)
      ? usersData.items
      : Array.isArray(usersData)
      ? usersData
      : [];
  },

  async listStages() {
    const data = unwrap(await leadStagesAPI.list());
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async createVisitReport(leadId, payload) {
    const data = unwrap(await leadsAPI.createVisitReport(leadId, payload));
    return data?.report || data;
  },

  async listVisitReports(leadId) {
    const data = unwrap(await leadsAPI.listVisitReports(leadId));
    return Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  },

  async uploadVisitPhoto(file) {
    const data = unwrap(await leadsAPI.uploadVisitPhoto(file));
    return data?.url || '';
  },

  async listComments(leadId) {
    const data = unwrap(await leadCommentsAPI.listByLead(leadId));
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    return items;
  },

  async addComment(leadId, comment, nextFollowupDate, nextFollowupTime) {
    const body = {
      referenceType: 'lead',
      referenceId: leadId,
      comment,
    };
    if (nextFollowupDate) body.nextFollowupDate = new Date(nextFollowupDate).toISOString();
    if (nextFollowupTime) body.nextFollowupTime = nextFollowupTime;
    const res = await leadCommentsAPI.create(body);
    const data = unwrap(res);
    return data?.comment || data;
  },
};
