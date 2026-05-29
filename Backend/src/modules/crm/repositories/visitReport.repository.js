const VisitReport = require('../models/visitReport.model');

const create = (data) => VisitReport.create(data);

const findByLeadId = (leadId) =>
  VisitReport.find({ leadId })
    .populate({ path: 'createdBy', select: 'name email' })
    .sort({ createdAt: -1 })
    .lean();

const findLatestByLeadId = (leadId) =>
  VisitReport.findOne({ leadId }).sort({ createdAt: -1 }).lean();

const countByLeadId = (leadId) => VisitReport.countDocuments({ leadId });

const findLeadIdsBetween = async (start, end) => {
  const docs = await VisitReport.find({ visitedAt: { $gte: start, $lte: end } })
    .select('leadId')
    .lean();
  return docs.map((d) => String(d.leadId));
};

module.exports = { create, findByLeadId, findLatestByLeadId, countByLeadId, findLeadIdsBetween };
