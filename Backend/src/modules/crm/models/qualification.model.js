const mongoose = require('mongoose');
const {
  QUALIFICATION_STATUS_VALUES,
  QUALIFICATION_STATUS,
} = require('../../../constants/statuses');
const { TEMPERATURE_VALUES } = require('../../../constants/temperatures');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, default: null },
    questionText: { type: String, required: true, trim: true },
    questionType: {
      type: String,
      enum: ['text', 'radio', 'dropdown', 'checkbox', 'textarea', 'number'],
      default: 'text',
    },
    answer: { type: mongoose.Schema.Types.Mixed, default: null },
    weight: { type: Number, default: 0 },
  },
  { _id: false }
);

const qualificationSchema = new mongoose.Schema(
  {
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      required: true,
      unique: true,
      index: true,
    },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, min: 0, max: 100, default: 0 },
    leadTemperature: { type: String, enum: TEMPERATURE_VALUES, default: 'cold', index: true },
    remarks: { type: String, trim: true, default: '' },
    nextFollowupAt: { type: Date, default: null, index: true },

    // Scheduled site-visit date — required for an enquiry to stay qualified.
    visitDate: { type: Date, default: null },

    qualificationStatus: {
      type: String,
      enum: QUALIFICATION_STATUS_VALUES,
      default: QUALIFICATION_STATUS.PENDING,
      index: true,
    },
    rejectionReason: { type: String, trim: true, default: '' },
    holdUntil: { type: Date, default: null },
    qualifiedAt: { type: Date, default: null },

    qualifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

qualificationSchema.index({ qualificationStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Qualification', qualificationSchema);
