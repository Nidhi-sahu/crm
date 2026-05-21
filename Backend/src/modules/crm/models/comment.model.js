const mongoose = require('mongoose');
const { REFERENCE_TYPE_VALUES } = require('../../../constants/referenceTypes');

const commentSchema = new mongoose.Schema(
  {
    referenceType: { type: String, enum: REFERENCE_TYPE_VALUES, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },

    comment: { type: String, required: true, trim: true, maxlength: 5000 },

    nextFollowupDate: { type: Date, default: null },
    nextFollowupTime: { type: String, trim: true, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

commentSchema.index({ referenceType: 1, referenceId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
