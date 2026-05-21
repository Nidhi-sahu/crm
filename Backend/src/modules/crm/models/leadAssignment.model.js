const mongoose = require('mongoose');
const { ASSIGNMENT_TRIGGER_VALUES, ASSIGNMENT_TRIGGER } = require('../../../constants/assignmentTriggers');

const leadAssignmentSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    previousAssignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    assignedAt: { type: Date, default: Date.now, index: true },

    autoAssigned: { type: Boolean, default: false, index: true },
    triggerType: {
      type: String,
      enum: ASSIGNMENT_TRIGGER_VALUES,
      default: ASSIGNMENT_TRIGGER.MANUAL,
      index: true,
    },
    assignmentReason: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

leadAssignmentSchema.index({ leadId: 1, assignedAt: -1 });

module.exports = mongoose.model('LeadAssignment', leadAssignmentSchema);
