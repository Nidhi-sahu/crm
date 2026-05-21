const mongoose = require('mongoose');

const leadStageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    order: { type: Number, required: true, unique: true, min: 1 },
    color: { type: String, trim: true, default: '#64748B' },
    description: { type: String, trim: true, default: '' },

    assignedRoles: [{ type: String, trim: true }],
    requiredFields: [{ type: String, trim: true }],
    allowedNextStages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LeadStage' }],

    slaHours: { type: Number, min: 0, default: 24 },

    isActive: { type: Boolean, default: true, index: true },
    isInitial: { type: Boolean, default: false },
    isFinal: { type: Boolean, default: false },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

leadStageSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('LeadStage', leadStageSchema);
