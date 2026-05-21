import { reportAPI } from './reportAPI';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const cleanParams = (params = {}) => {
  const out = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === '' || v === null || v === undefined) return;
    out[k] = v;
  });
  return out;
};

export const reportService = {
  // Combined report build — conversion funnel + per-stage pipeline + time + value.
  async generate(params = {}) {
    const p = cleanParams(params);

    const [funnelRes, stagesRes, delayRes, scoreRes, completionRes] = await Promise.all([
      reportAPI.conversionFunnel(p),
      reportAPI.stageFunnel(p),
      reportAPI.stageDelay(p),
      reportAPI.salespersonScorecard(p),
      reportAPI.avgCompletionTime(p),
    ]);

    const funnelData = unwrap(funnelRes) || {};
    const baseStages = Array.isArray(funnelData.stages) ? funnelData.stages : [];
    const enquiries = num(baseStages.find((s) => s.label === 'Enquiries')?.count);
    const qualified = num(baseStages.find((s) => s.label === 'Qualified')?.count);
    const converted = num(baseStages.find((s) => s.label === 'Won')?.count);
    const conversionRate = num(funnelData.overallConversionRate);

    const pipelineStages = (Array.isArray(unwrap(stagesRes)) ? unwrap(stagesRes) : [])
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((s) => ({ label: s.name, count: num(s.leadCount) }));

    // Full funnel: Enquiries -> Qualified -> [pipeline stages] -> Converted
    const top = enquiries || 1;
    const rawFunnel = [
      { label: 'Enquiries', count: enquiries },
      { label: 'Qualified', count: qualified },
      ...pipelineStages,
      { label: 'Converted', count: converted },
    ];
    const funnel = rawFunnel.map((s, i) => ({
      label: s.label,
      count: s.count,
      pctOfTop: top > 0 ? Number(((s.count / top) * 100).toFixed(1)) : 0,
      pctOfPrev:
        i === 0
          ? 100
          : rawFunnel[i - 1].count > 0
            ? Number(((s.count / rawFunnel[i - 1].count) * 100).toFixed(1))
            : 0,
    }));

    const time = (Array.isArray(unwrap(delayRes)) ? unwrap(delayRes) : []).map((t) => ({
      stageName: t.stageName || 'Stage',
      avgDays: num(t.avgDays),
      avgHours: num(t.avgHours),
      minHours: num(t.minHours),
      maxHours: num(t.maxHours),
      sampleCount: num(t.sampleCount),
    }));

    const scorecard = (Array.isArray(unwrap(scoreRes)) ? unwrap(scoreRes) : []).map((r) => ({
      userId: r.userId,
      name: r.name || r.email || 'Unknown',
      role: r.role,
      total: num(r.total),
      won: num(r.won),
      lost: num(r.lost),
      revenue: num(r.revenue),
      winRate: num(r.winRate),
      avgCompletionDays: num(r.avgCompletionDays),
    }));

    const totalValue = scorecard.reduce((s, r) => s + r.revenue, 0);
    const completion = unwrap(completionRes) || {};
    const dealsClosed = num(completion.count);
    const avgValue = dealsClosed > 0 ? Math.round(totalValue / dealsClosed) : 0;

    return {
      performance: { totalEnquiries: enquiries, qualified, converted, conversionRate },
      funnel,
      time,
      value: { totalValue, avgValue, dealsClosed, avgCompletionDays: num(completion.avgDays) },
      scorecard,
      generatedAt: new Date().toISOString(),
    };
  },
};
