const mongoose = require('mongoose');

const VISIT_NUMBERS = ['1st', '2nd', '3rd', '4th+'];

const visitReportSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', default: null },

    visitedAt: { type: Date, default: () => new Date() },

    customerName: { type: String, trim: true, default: '' },
    contactNumber: { type: String, trim: true, default: '' },
    salesPersonName: { type: String, trim: true, default: '' },
    visitorName: { type: String, trim: true, default: '' },
    projectVisited: { type: String, trim: true, default: '' },
    propertyInterested: { type: String, trim: true, default: '' },
    customerBudget: { type: String, trim: true, default: '' },
    customerProfession: { type: String, trim: true, default: '' },
    customerAddress: { type: String, trim: true, default: '' },
    sourceOfCustomer: { type: String, trim: true, default: '' },
    seniorPerson: { type: String, trim: true, default: '' },
    visitNumber: { type: String, enum: VISIT_NUMBERS, default: '1st' },

    // Photo upload deferred (S3 later) — stores URL once wired.
    photoUrl: { type: String, trim: true, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

visitReportSchema.index({ leadId: 1, createdAt: -1 });

module.exports = mongoose.model('VisitReport', visitReportSchema);
module.exports.VISIT_NUMBERS = VISIT_NUMBERS;
