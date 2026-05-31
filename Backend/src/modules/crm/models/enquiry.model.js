const mongoose = require('mongoose');
const { ENQUIRY_STATUS_VALUES, ENQUIRY_STATUS } = require('../../../constants/statuses');
const { TEMPERATURE_VALUES, TEMPERATURES } = require('../../../constants/temperatures');
const { SOURCE_VALUES } = require('../../../constants/sources');
const { CLIENT_TYPE_VALUES } = require('../../../constants/clientTypes');

const enquirySchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true, default: '' },
    clientType: { type: String, enum: ['', ...CLIENT_TYPE_VALUES], default: '' },
    clientEmail: { type: String, trim: true, lowercase: true, default: '' },
    clientPhone: { type: String, trim: true, default: '', index: true },
    alternatePhone: { type: String, trim: true, default: '' },
    dateOfEnquiry: { type: Date, default: () => new Date() },

    source: { type: String, enum: SOURCE_VALUES, required: true, index: true },
    brokerName: { type: String, trim: true, default: '' },

    propertyType: { type: String, trim: true, default: '' },
    project: { type: String, trim: true, default: '' },

    budgetMin: { type: Number, min: 0, default: 0 },
    budgetMax: { type: Number, min: 0, default: 0 },
    timeline: { type: String, trim: true, default: '' },

    temperature: {
      type: String,
      enum: TEMPERATURE_VALUES,
      default: TEMPERATURES.COLD,
      index: true,
    },
    status: {
      type: String,
      enum: ENQUIRY_STATUS_VALUES,
      default: ENQUIRY_STATUS.NEW,
      index: true,
    },

    remarks: { type: String, trim: true, default: '' },
    nextFollowupAt: { type: Date, default: null, index: true },
    followupTime: { type: String, trim: true, default: '' },

    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    occupation: {
      type: String,
      enum: ['', 'Government Job', 'Private Job', 'Business'],
      default: '',
    },
    requirement: { type: String, trim: true, default: '' },
    preferredLocation: { type: String, trim: true, default: '' },
    preferredVisitDate: { type: Date, default: null },
    familySize: { type: Number, min: 0, default: null },

    assignedQualificationUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    // Telesales user this enquiry is distributed to (bulk import / distribution)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    // Set when an enquiry was qualified without a visit date and moved back to pending.
    previouslyQualified: { type: Boolean, default: false },
    movedBackAt: { type: Date, default: null },

    // Walk-in clients enter post-visit without going through earlier stages.
    isWalkIn: { type: Boolean, default: false, index: true },

    // Per #30: link to a previously CLOSED lead (dropped/lost/won/rejected)
    // for the same customer — surfaced on Enquiry Details to flag repeat clients.
    linkedClosedLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true,
    },

    qualificationAnswers: { type: mongoose.Schema.Types.Mixed, default: {} },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ temperature: 1, createdAt: -1 });
enquirySchema.index({ createdBy: 1, createdAt: -1 });
enquirySchema.index({ clientName: 'text', remarks: 'text' });

module.exports = mongoose.model('Enquiry', enquirySchema);
