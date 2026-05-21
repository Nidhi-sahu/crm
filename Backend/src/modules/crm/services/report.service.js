const mongoose = require('mongoose');
const Enquiry = require('../models/enquiry.model');
const Qualification = require('../models/qualification.model');
const Lead = require('../models/lead.model');
const LeadStageHistory = require('../models/leadStageHistory.model');
const Reminder = require('../models/reminder.model');
const { LEAD_STATUS, QUALIFICATION_STATUS } = require('../../../constants/statuses');

const toObjectId = (id) =>
  id && mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

const buildDateFilter = ({ from, to }, field = 'createdAt') => {
  if (!from && !to) return {};
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return { [field]: range };
};

const buildLeadFilter = ({ from, to, salespersonId, source, project } = {}) => {
  const filter = { ...buildDateFilter({ from, to }) };
  const sp = toObjectId(salespersonId);
  if (sp) filter.assignedTo = sp;
  if (source) filter.source = source;
  if (project) filter.project = { $regex: project, $options: 'i' };
  return filter;
};

const conversionFunnel = async (query = {}) => {
  const enquiryFilter = buildDateFilter(query);
  const [enquiryCount, qualifiedCount, leadCount, wonCount] = await Promise.all([
    Enquiry.countDocuments(enquiryFilter),
    Qualification.countDocuments({
      ...buildDateFilter(query),
      qualificationStatus: QUALIFICATION_STATUS.QUALIFIED,
    }),
    Lead.countDocuments(buildLeadFilter(query)),
    Lead.countDocuments({ ...buildLeadFilter(query), status: LEAD_STATUS.WON }),
  ]);

  const pct = (num, den) => (den > 0 ? Number(((num / den) * 100).toFixed(2)) : 0);

  return {
    stages: [
      { label: 'Enquiries', count: enquiryCount, pctOfPrevious: 100, pctOfTop: 100 },
      { label: 'Qualified', count: qualifiedCount, pctOfPrevious: pct(qualifiedCount, enquiryCount), pctOfTop: pct(qualifiedCount, enquiryCount) },
      { label: 'Leads', count: leadCount, pctOfPrevious: pct(leadCount, qualifiedCount), pctOfTop: pct(leadCount, enquiryCount) },
      { label: 'Won', count: wonCount, pctOfPrevious: pct(wonCount, leadCount), pctOfTop: pct(wonCount, enquiryCount) },
    ],
    overallConversionRate: pct(wonCount, enquiryCount),
  };
};

const sourceAnalytics = async (query = {}) => {
  const enquiryFilter = buildDateFilter(query);
  const leadFilter = buildLeadFilter(query);

  const [enquiryGroups, leadGroups] = await Promise.all([
    Enquiry.aggregate([
      { $match: enquiryFilter },
      {
        $group: {
          _id: '$source',
          enquiries: { $sum: 1 },
          qualified: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        },
      },
    ]),
    Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: '$source',
          leads: { $sum: 1 },
          won: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.WON] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.LOST] }, 1, 0] } },
          revenue: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.WON] }, '$expectedRevenue', 0] } },
        },
      },
    ]),
  ]);

  const eBy = Object.fromEntries(enquiryGroups.map((g) => [g._id, g]));
  const lBy = Object.fromEntries(leadGroups.map((g) => [g._id, g]));
  const sources = new Set([...Object.keys(eBy), ...Object.keys(lBy)]);

  return Array.from(sources)
    .map((source) => {
      const e = eBy[source] || { enquiries: 0, qualified: 0, rejected: 0 };
      const l = lBy[source] || { leads: 0, won: 0, lost: 0, revenue: 0 };
      const pct = (n, d) => (d > 0 ? Number(((n / d) * 100).toFixed(2)) : 0);
      return {
        source,
        enquiries: e.enquiries,
        qualified: e.qualified,
        rejected: e.rejected,
        leads: l.leads,
        won: l.won,
        lost: l.lost,
        revenue: l.revenue,
        qualificationRate: pct(e.qualified, e.enquiries),
        winRate: pct(l.won, l.leads),
        overallConversion: pct(l.won, e.enquiries),
      };
    })
    .sort((a, b) => b.won - a.won);
};

const lostReasons = async (query = {}) => {
  const filter = { ...buildLeadFilter(query), status: LEAD_STATUS.LOST };
  const groups = await Lead.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $cond: [{ $or: [{ $eq: ['$lostReason', ''] }, { $eq: ['$lostReason', null] }] }, '(no reason)', '$lostReason'] },
        count: { $sum: 1 },
        totalRevenueLost: { $sum: '$expectedRevenue' },
      },
    },
    { $project: { _id: 0, reason: '$_id', count: 1, totalRevenueLost: 1 } },
    { $sort: { count: -1 } },
  ]);
  return groups;
};

const avgCompletionTime = async (query = {}) => {
  const filter = { ...buildLeadFilter(query), status: LEAD_STATUS.WON, closedAt: { $ne: null } };
  const [result] = await Lead.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgMs: { $avg: { $subtract: ['$closedAt', '$createdAt'] } },
        minMs: { $min: { $subtract: ['$closedAt', '$createdAt'] } },
        maxMs: { $max: { $subtract: ['$closedAt', '$createdAt'] } },
      },
    },
  ]);
  if (!result) return { count: 0, avgDays: 0, avgHours: 0, minDays: 0, maxDays: 0 };
  return {
    count: result.count,
    avgHours: Number((result.avgMs / 3600000).toFixed(2)),
    avgDays: Number((result.avgMs / 86400000).toFixed(2)),
    minDays: Number((result.minMs / 86400000).toFixed(2)),
    maxDays: Number((result.maxMs / 86400000).toFixed(2)),
  };
};

const stageDelay = async () => {
  const data = await LeadStageHistory.aggregate([
    { $match: { isUndo: false } },
    { $sort: { leadId: 1, movedAt: 1 } },
    {
      $group: {
        _id: '$leadId',
        moves: { $push: { stage: '$toStageId', stageName: '$toStageName', at: '$movedAt' } },
      },
    },
    {
      $project: {
        transitions: {
          $map: {
            input: { $range: [0, { $max: [0, { $subtract: [{ $size: '$moves' }, 1] }] }] },
            as: 'i',
            in: {
              stageId: { $arrayElemAt: ['$moves.stage', '$$i'] },
              stageName: { $arrayElemAt: ['$moves.stageName', '$$i'] },
              durationMs: {
                $subtract: [
                  { $arrayElemAt: ['$moves.at', { $add: ['$$i', 1] }] },
                  { $arrayElemAt: ['$moves.at', '$$i'] },
                ],
              },
            },
          },
        },
      },
    },
    { $unwind: '$transitions' },
    {
      $group: {
        _id: { stageId: '$transitions.stageId', stageName: '$transitions.stageName' },
        avgMs: { $avg: '$transitions.durationMs' },
        minMs: { $min: '$transitions.durationMs' },
        maxMs: { $max: '$transitions.durationMs' },
        sampleCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        stageId: '$_id.stageId',
        stageName: '$_id.stageName',
        avgHours: { $round: [{ $divide: ['$avgMs', 3600000] }, 2] },
        avgDays: { $round: [{ $divide: ['$avgMs', 86400000] }, 2] },
        minHours: { $round: [{ $divide: ['$minMs', 3600000] }, 2] },
        maxHours: { $round: [{ $divide: ['$maxMs', 3600000] }, 2] },
        sampleCount: 1,
      },
    },
    { $sort: { stageName: 1 } },
  ]);
  return data;
};

const salespersonScorecard = async (query = {}) => {
  const filter = buildLeadFilter(query);
  delete filter.assignedTo;

  const rows = await Lead.aggregate([
    { $match: { ...filter, assignedTo: { $ne: null } } },
    {
      $group: {
        _id: '$assignedTo',
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.ACTIVE] }, 1, 0] } },
        won: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.WON] }, 1, 0] } },
        lost: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.LOST] }, 1, 0] } },
        dropped: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.DROPPED] }, 1, 0] } },
        revenue: { $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.WON] }, '$expectedRevenue', 0] } },
        avgCompletionMs: {
          $avg: {
            $cond: [
              { $and: [{ $eq: ['$status', LEAD_STATUS.WON] }, { $ne: ['$closedAt', null] }] },
              { $subtract: ['$closedAt', '$createdAt'] },
              null,
            ],
          },
        },
      },
    },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $lookup: { from: 'roles', localField: 'user.roleId', foreignField: '_id', as: 'role' } },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        role: { $ifNull: [{ $arrayElemAt: ['$role.name', 0] }, null] },
        total: 1, active: 1, won: 1, lost: 1, dropped: 1, revenue: 1,
        winRate: { $cond: [{ $gt: ['$total', 0] }, { $round: [{ $multiply: [{ $divide: ['$won', '$total'] }, 100] }, 2] }, 0] },
        avgCompletionDays: { $round: [{ $divide: [{ $ifNull: ['$avgCompletionMs', 0] }, 86400000] }, 2] },
      },
    },
    { $sort: { revenue: -1, won: -1 } },
  ]);

  return rows;
};

const overdueFollowups = async (query = {}) => {
  const filter = { status: 'pending', reminderAt: { $lt: new Date() } };
  const sp = toObjectId(query.salespersonId);
  if (sp) filter.assignedTo = sp;

  const [total, byUser] = await Promise.all([
    Reminder.countDocuments(filter),
    Reminder.aggregate([
      { $match: filter },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 0, userId: '$_id', name: '$user.name', email: '$user.email', count: 1 } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return { total, byUser };
};

module.exports = {
  conversionFunnel,
  sourceAnalytics,
  lostReasons,
  avgCompletionTime,
  stageDelay,
  salespersonScorecard,
  overdueFollowups,
};
