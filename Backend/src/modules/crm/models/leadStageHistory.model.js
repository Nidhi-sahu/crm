const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    name: { type: String, trim: true, default: '' },
    mimeType: { type: String, trim: true, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: false }
);

const leadStageHistorySchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },

    fromStageId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeadStage', default: null },
    toStageId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeadStage', required: true },

    fromStageName: { type: String, trim: true, default: '' },
    toStageName: { type: String, trim: true, default: '' },

    movedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    movedAt: { type: Date, default: Date.now },

    plannedAt: { type: Date, default: null },
    actualAt: { type: Date, default: Date.now },

    comment: { type: String, trim: true, default: '' },
    attachments: { type: [attachmentSchema], default: [] },

    isUndo: { type: Boolean, default: false },
    undoneEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeadStageHistory', default: null },
  },
  { timestamps: true }
);

leadStageHistorySchema.index({ leadId: 1, movedAt: -1 });

module.exports = mongoose.model('LeadStageHistory', leadStageHistorySchema);
