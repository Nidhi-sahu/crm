import { axiosClient } from '../../../../shared/api/axiosClient';
import { SALES_PERSON_ROLE_NAME } from '../constants/assignmentColumns';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export const salespersonAPI = {
  async fetchSalesPersons() {
    // 1. fetch roles to find Sales Person id
    let salesPersonRoleId = null;
    try {
      const rolesRes = await axiosClient.get('/roles', { params: { limit: 100 } });
      const data = unwrap(rolesRes);
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      const match = items.find(
        (r) => (r.name || '').trim().toLowerCase() === SALES_PERSON_ROLE_NAME.toLowerCase(),
      );
      salesPersonRoleId = match?._id || null;
    } catch (_) {
      salesPersonRoleId = null;
    }

    const params = { limit: 100, status: 'active' };
    if (salesPersonRoleId) params.roleId = salesPersonRoleId;

    const res = await axiosClient.get('/users', { params });
    const data = unwrap(res);
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

    if (salesPersonRoleId) return items;
    return items.filter((u) => {
      const r = u.role || u.roleId;
      const name = (r?.name || '').toLowerCase();
      return name === SALES_PERSON_ROLE_NAME.toLowerCase();
    });
  },

  async fetchWorkload() {
    const res = await axiosClient.get('/dashboard/salesperson-performance');
    const data = unwrap(res);
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      userId: row.userId,
      name: row.name || row.email || 'Unknown',
      email: row.email,
      total: Number(row.total) || 0,
      active: Number(row.active) || 0,
      won: Number(row.won) || 0,
      lost: Number(row.lost) || 0,
      conversionRate: Number(row.conversionRate) || 0,
    }));
  },
};
