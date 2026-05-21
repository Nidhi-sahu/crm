import { dashboardAPI } from './dashboardAPI';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

const safeNumber = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);

export const dashboardService = {
  async getOverview(filters = {}) {
    const data = unwrap(await dashboardAPI.overview(filters)) || {};
    const totalEnquiries = safeNumber(data.totalEnquiries);
    const totalLeads = safeNumber(data.totalLeads ?? data.qualifiedLeads);

    const pendingQualification = Math.max(totalEnquiries - totalLeads, 0);
    const qualificationConversionRate =
      totalEnquiries > 0 ? Number(((totalLeads / totalEnquiries) * 100).toFixed(2)) : 0;

    return {
      raw: data,
      kpis: {
        totalEnquiries,
        pendingQualification,
        qualifiedLeads: totalLeads,
        qualificationConversionRate,
      },
    };
  },

  async getSourceBreakdown(filters = {}) {
    const data = unwrap(await dashboardAPI.sourceBreakdown(filters)) || [];
    if (!Array.isArray(data)) return [];
    return data
      .map((row) => ({
        source: row.source || 'Unknown',
        totalLeads: safeNumber(row.totalLeads),
        wonLeads: safeNumber(row.wonLeads),
        enquiryCount: safeNumber(row.enquiryCount),
        conversionRate: safeNumber(row.conversionRate),
      }))
      .filter((row) => row.totalLeads > 0 || row.enquiryCount > 0);
  },

  async getSalespersonPerformance(filters = {}) {
    const data = unwrap(await dashboardAPI.salespersonPerformance(filters)) || [];
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      userId: row.userId,
      name: row.name || row.email || 'Unknown',
      email: row.email,
      total: safeNumber(row.total),
      active: safeNumber(row.active),
      won: safeNumber(row.won),
      lost: safeNumber(row.lost),
      totalRevenue: safeNumber(row.totalRevenue),
      conversionRate: safeNumber(row.conversionRate),
    }));
  },

  async getEnquiryTrends(filters = {}) {
    const data = unwrap(await dashboardAPI.enquiryTrends(filters)) || [];
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      date: row.date,
      enquiries: safeNumber(row.enquiries ?? row.count),
      qualified: safeNumber(row.qualified),
    }));
  },

  async getConversionFunnel(filters = {}) {
    const data = unwrap(await dashboardAPI.conversionFunnel(filters)) || {};
    const stages = Array.isArray(data.stages) ? data.stages : [];
    return {
      stages: stages.map((s) => ({
        label: s.label || 'Stage',
        count: safeNumber(s.count),
        pctOfPrevious: safeNumber(s.pctOfPrevious),
        pctOfTop: safeNumber(s.pctOfTop),
      })),
      overallConversionRate: safeNumber(data.overallConversionRate),
    };
  },
};
