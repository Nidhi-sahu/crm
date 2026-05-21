const mongoose = require('mongoose');
const Enquiry = require('../models/enquiry.model');
const Lead = require('../models/lead.model');
const LeadStage = require('../models/leadStage.model');
const Reminder = require('../models/reminder.model');
const { LEAD_STATUS } = require('../../../constants/statuses');
const { TEMPERATURES } = require('../../../constants/temperatures');

const toObjectId = (id) =>
  id && mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

const buildLeadFilter = ({ from, to, salespersonId, source, project } = {}) => {
  const filter = {};
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  const sp = toObjectId(salespersonId);
  if (sp) filter.assignedTo = sp;
  if (source) filter.source = source;
  if (project) filter.project = { $regex: project, $options: 'i' };
  return filter;
};

const buildEnquiryFilter = ({ from, to, source, project } = {}) => {
  const filter = {};
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (source) filter.source = source;
  if (project) filter.project = { $regex: project, $options: 'i' };
  return filter;
};

const startOfDay = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const endOfDay = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; };

const overview = async (query = {}) => {
  const leadFilter = buildLeadFilter(query);
  const enquiryFilter = buildEnquiryFilter(query);

  const [
    totalEnquiries,
    statusGroups,
    tempGroups,
    assignedGroups,
    todayCount,
    overdueCount,
  ] = await Promise.all([
    Enquiry.countDocuments(enquiryFilter),
    Lead.aggregate([
      { $match: leadFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: leadFilter },
      { $group: { _id: '$temperature', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$assignedTo', null] }, 'unassigned', 'assigned'],
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Reminder.countDocuments({ status: 'pending', reminderAt: { $gte: startOfDay(), $lte: endOfDay() } }),
    Reminder.countDocuments({ status: 'pending', reminderAt: { $lt: new Date() } }),
  ]);

  const statusByKey = Object.fromEntries(statusGroups.map((g) => [g._id, g.count]));
  const tempByKey = Object.fromEntries(tempGroups.map((g) => [g._id, g.count]));
  const assignedByKey = Object.fromEntries(assignedGroups.map((g) => [g._id, g.count]));

  const totalLeads = statusGroups.reduce((s, g) => s + g.count, 0);
  const wonLeads = statusByKey[LEAD_STATUS.WON] || 0;
  const conversionRate = totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(2)) : 0;

  return {
    totalEnquiries,
    totalLeads,
    qualifiedLeads: totalLeads,
    leadsByStatus: {
      active: statusByKey[LEAD_STATUS.ACTIVE] || 0,
      won: wonLeads,
      lost: statusByKey[LEAD_STATUS.LOST] || 0,
      dropped: statusByKey[LEAD_STATUS.DROPPED] || 0,
    },
    leadsByTemperature: {
      hot: tempByKey[TEMPERATURES.HOT] || 0,
      warm: tempByKey[TEMPERATURES.WARM] || 0,
      cold: tempByKey[TEMPERATURES.COLD] || 0,
    },
    assignment: {
      assigned: assignedByKey.assigned || 0,
      unassigned: assignedByKey.unassigned || 0,
    },
    followups: {
      today: todayCount,
      overdue: overdueCount,
    },
    conversionRate,
  };
};

const stageFunnel = async (query = {}) => {
  const leadFilter = buildLeadFilter(query);

  const stages = await LeadStage.aggregate([
    { $match: { isActive: true } },
    { $sort: { order: 1 } },
    {
      $lookup: {
        from: 'leads',
        let: { stageId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$currentStageId', '$$stageId'] },
              ...leadFilter,
            },
          },
          { $count: 'count' },
        ],
        as: 'leadCounts',
      },
    },
    {
      $project: {
        _id: 0,
        stageId: '$_id',
        name: 1,
        order: 1,
        color: 1,
        isFinal: 1,
        leadCount: { $ifNull: [{ $arrayElemAt: ['$leadCounts.count', 0] }, 0] },
      },
    },
  ]);

  return stages;
};

const salespersonPerformance = async (query = {}) => {
  const leadFilter = buildLeadFilter(query);
  delete leadFilter.assignedTo;

  return Lead.aggregate([
    { $match: { ...leadFilter, assignedTo: { $ne: null } } },
    {
      $group: {
        _id: '$assignedTo',
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.ACTIVE] }, 1, 0] } },
        won: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.WON] }, 1, 0] } },
        lost: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.LOST] }, 1, 0] } },
        dropped: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.DROPPED] }, 1, 0] } },
        totalRevenue: {
          $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.WON] }, '$expectedRevenue', 0] },
        },
      },
    },
    {
      $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        total: 1,
        active: 1,
        won: 1,
        lost: 1,
        dropped: 1,
        totalRevenue: 1,
        conversionRate: {
          $cond: [
            { $gt: ['$total', 0] },
            { $round: [{ $multiply: [{ $divide: ['$won', '$total'] }, 100] }, 2] },
            0,
          ],
        },
      },
    },
    { $sort: { won: -1, total: -1 } },
  ]);
};

const sourceBreakdown = async (query = {}) => {
  const enquiryFilter = buildEnquiryFilter(query);
  const leadFilter = buildLeadFilter(query);

  const [enquiryGroups, leadGroups] = await Promise.all([
    Enquiry.aggregate([
      { $match: enquiryFilter },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: '$source',
          totalLeads: { $sum: 1 },
          wonLeads: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.WON] }, 1, 0] } },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.WON] }, '$expectedRevenue', 0] },
          },
        },
      },
    ]),
  ]);

  const enquiryBySource = Object.fromEntries(enquiryGroups.map((g) => [g._id, g.count]));
  const leadBySource = Object.fromEntries(leadGroups.map((g) => [g._id, g]));

  const sources = new Set([...Object.keys(enquiryBySource), ...Object.keys(leadBySource)]);
  return Array.from(sources).map((source) => {
    const enquiryCount = enquiryBySource[source] || 0;
    const leadStats = leadBySource[source] || { totalLeads: 0, wonLeads: 0, totalRevenue: 0 };
    const conversionRate = enquiryCount > 0
      ? Number(((leadStats.wonLeads / enquiryCount) * 100).toFixed(2))
      : 0;
    return {
      source,
      enquiryCount,
      totalLeads: leadStats.totalLeads,
      wonLeads: leadStats.wonLeads,
      totalRevenue: leadStats.totalRevenue,
      conversionRate,
    };
  }).sort((a, b) => b.totalLeads - a.totalLeads);
};

const temperatureBreakdown = async (query = {}) => {
  const leadFilter = buildLeadFilter(query);
  const groups = await Lead.aggregate([
    { $match: leadFilter },
    {
      $group: {
        _id: '$temperature',
        count: { $sum: 1 },
        won: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.WON] }, 1, 0] } },
        lost: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.LOST] }, 1, 0] } },
        active: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.ACTIVE] }, 1, 0] } },
      },
    },
  ]);
  return Object.values(TEMPERATURES).map((t) => {
    const g = groups.find((x) => x._id === t) || { count: 0, won: 0, lost: 0, active: 0 };
    return { temperature: t, count: g.count, won: g.won, lost: g.lost, active: g.active };
  });
};

const negotiationPipeline = async (query = {}) => {
  const leadFilter = buildLeadFilter(query);
  const negotiationStage = await LeadStage.findOne({ name: 'Negotiation' }).lean();
  if (!negotiationStage) return { count: 0, totalExpectedRevenue: 0, stage: null };

  const [result] = await Lead.aggregate([
    {
      $match: {
        ...leadFilter,
        currentStageId: negotiationStage._id,
        status: LEAD_STATUS.ACTIVE,
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalExpectedRevenue: { $sum: '$expectedRevenue' },
      },
    },
  ]);

  return {
    stage: { id: negotiationStage._id, name: negotiationStage.name, color: negotiationStage.color },
    count: result ? result.count : 0,
    totalExpectedRevenue: result ? result.totalExpectedRevenue : 0,
  };
};

const finalDeals = async (query = {}) => {
  const leadFilter = buildLeadFilter(query);
  const [result] = await Lead.aggregate([
    { $match: { ...leadFilter, status: LEAD_STATUS.WON } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalRevenue: { $sum: '$expectedRevenue' },
      },
    },
  ]);
  return {
    count: result ? result.count : 0,
    totalRevenue: result ? result.totalRevenue : 0,
  };
};

const enquiryStatusBreakdown = async (query = {}) => {
  const filter = buildEnquiryFilter(query);
  const groups = await Enquiry.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const by = Object.fromEntries(groups.map((g) => [g._id, g.count]));
  const pending = (by.new || 0) + (by.contacted || 0) + (by.hold || 0);
  const qualified = (by.qualified || 0) + (by.converted || 0);
  const notQualified = by.rejected || 0;
  return {
    total: pending + qualified + notQualified,
    pending,
    qualified,
    notQualified,
  };
};

const enquiryTrends = async (query = {}) => {
  const days = Math.min(Math.max(Number(query.days) || 30, 1), 365);

  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const sourceFilter = query.source ? { source: query.source } : {};
  const projectFilter = query.project
    ? { project: { $regex: query.project, $options: 'i' } }
    : {};

  const buildPipeline = () => [
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        ...sourceFilter,
        ...projectFilter,
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ];

  const [enquiryGroups, leadGroups] = await Promise.all([
    Enquiry.aggregate(buildPipeline()),
    Lead.aggregate(buildPipeline()),
  ]);

  const enquiryByDate = Object.fromEntries(enquiryGroups.map((g) => [g._id, g.count]));
  const qualifiedByDate = Object.fromEntries(leadGroups.map((g) => [g._id, g.count]));

  const series = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    series.push({
      date: key,
      enquiries: enquiryByDate[key] || 0,
      qualified: qualifiedByDate[key] || 0,
    });
  }
  return series;
};

module.exports = {
  overview,
  stageFunnel,
  salespersonPerformance,
  sourceBreakdown,
  temperatureBreakdown,
  negotiationPipeline,
  finalDeals,
  enquiryTrends,
  enquiryStatusBreakdown,
};
