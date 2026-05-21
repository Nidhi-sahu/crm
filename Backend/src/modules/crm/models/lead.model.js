const mongoose = require('mongoose');
const { LEAD_STATUS_VALUES, LEAD_STATUS } = require('../../../constants/statuses');
const { TEMPERATURE_VALUES, TEMPERATURES } = require('../../../constants/temperatures');
const { SOURCE_VALUES } = require('../../../constants/sources');

const leadSchema = new mongoose.Schema(
  {
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      required: true,
      unique: true,
      index: true,
    },
    qualificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Qualification',
      default: null,
    },

    currentStageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeadStage',
      required: true,
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedAt: { type: Date, default: null },

    temperature: {
      type: String,
      enum: TEMPERATURE_VALUES,
      default: TEMPERATURES.WARM,
      index: true,
    },
    source: { type: String, enum: SOURCE_VALUES, required: true, index: true },
    project: { type: String, trim: true, default: '' },
    propertyType: { type: String, trim: true, default: '' },
    budget: { type: Number, min: 0, default: 0 },
    expectedRevenue: { type: Number, min: 0, default: 0 },
    actualValue: { type: Number, min: 0, default: null },

    status: {
      type: String,
      enum: LEAD_STATUS_VALUES,
      default: LEAD_STATUS.ACTIVE,
      index: true,
    },
    lostReason: { type: String, trim: true, default: '' },
    closedAt: { type: Date, default: null },

    plannedStageAt: { type: Date, default: null },
    actualStageAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now, index: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ currentStageId: 1, status: 1 });
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ assignedTo: 1, currentStageId: 1 });

module.exports = mongoose.model('Lead', leadSchema);
