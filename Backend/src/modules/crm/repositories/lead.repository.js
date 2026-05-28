const Lead = require('../models/lead.model');

const create = (data) => Lead.create(data);

const findById = (id) =>
  Lead.findById(id)
    .populate({
      path: 'enquiryId',
      select:
        'clientName clientPhone clientEmail companyName requirement budgetMin budgetMax',
    })
    .populate({ path: 'currentStageId', select: 'name order color isFinal allowedNextStages' })
    .populate({ path: 'assignedTo', select: 'name email' })
    .populate({ path: 'visitAssignedTo', select: 'name email' })
    .populate({ path: 'createdBy', select: 'name email' })
    .lean();

const findByEnquiryId = (enquiryId) => Lead.findOne({ enquiryId }).lean();

const findAll = ({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 20 }) =>
  Lead.find(filter)
    .populate({
      path: 'enquiryId',
      select: 'clientName clientPhone clientEmail companyName requirement',
    })
    .populate({ path: 'currentStageId', select: 'name order color isFinal allowedNextStages' })
    .populate({ path: 'assignedTo', select: 'name email' })
    .populate({ path: 'visitAssignedTo', select: 'name email' })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

const countAll = (filter = {}) => Lead.countDocuments(filter);

const update = (id, data) =>
  Lead.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate({ path: 'currentStageId', select: 'name order color isFinal' })
    .populate({ path: 'assignedTo', select: 'name email' })
    .lean();

const updateRaw = (id, ops) =>
  Lead.findByIdAndUpdate(id, ops, { new: true, runValidators: true });

const moveStage = (id, { toStageId, actor, plannedAt, actualAt }) =>
  Lead.findByIdAndUpdate(
    id,
    {
      $set: {
        currentStageId: toStageId,
        plannedStageAt: plannedAt || null,
        actualStageAt: actualAt || new Date(),
        lastActivityAt: new Date(),
        updatedBy: actor && actor._id,
      },
    },
    { new: true, runValidators: true }
  );

const remove = (id) => Lead.findByIdAndDelete(id);

const countInStage = (stageId) => Lead.countDocuments({ currentStageId: stageId });

const findUnassignedOlderThan = (date, limit = 50) =>
  Lead.find({
    assignedTo: null,
    status: 'active',
    createdAt: { $lt: date },
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

const claimForAssignment = (leadId, assignedTo) =>
  Lead.findOneAndUpdate(
    { _id: leadId, assignedTo: null },
    {
      $set: {
        assignedTo,
        assignedAt: new Date(),
        lastActivityAt: new Date(),
      },
    },
    { new: true }
  );

const setAssignment = (leadId, { assignedTo, actor }) =>
  Lead.findByIdAndUpdate(
    leadId,
    {
      $set: {
        assignedTo: assignedTo || null,
        assignedAt: assignedTo ? new Date() : null,
        lastActivityAt: new Date(),
        updatedBy: actor && actor._id,
      },
    },
    { new: true, runValidators: true }
  );

const setVisitAssignment = (leadId, { visitAssignedTo, actor }) =>
  Lead.findByIdAndUpdate(
    leadId,
    {
      $set: {
        visitAssignedTo: visitAssignedTo || null,
        visitAssignedAt: visitAssignedTo ? new Date() : null,
        lastActivityAt: new Date(),
        updatedBy: actor && actor._id,
      },
    },
    { new: true, runValidators: true }
  );

const getWorkloadByUserIds = (userIds) =>
  Lead.aggregate([
    {
      $match: {
        status: 'active',
        assignedTo: { $in: userIds },
      },
    },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
  ]);

module.exports = {
  create,
  findById,
  findByEnquiryId,
  findAll,
  countAll,
  update,
  updateRaw,
  moveStage,
  remove,
  countInStage,
  findUnassignedOlderThan,
  claimForAssignment,
  setAssignment,
  setVisitAssignment,
  getWorkloadByUserIds,
};
