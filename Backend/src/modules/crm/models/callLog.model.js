const mongoose = require('mongoose');

const CALL_OUTCOMES = [
  'connected',
  'not_picked',
  'busy',
  'switched_off',
  'wrong_number',
  'call_back_later',
];

const callLogSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', default: null },
    calledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    phoneNumber: { type: String, trim: true, default: '' },
    direction: { type: String, enum: ['outbound', 'inbound'], default: 'outbound' },
    outcome: { type: String, enum: CALL_OUTCOMES, default: 'connected' },
    durationSeconds: { type: Number, min: 0, default: 0 },
    // Stage the lead was on when the call was made — for context in reports.
    stageName: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },

    // Phase 2 (cloud-telephony) fields — auto-filled by a provider webhook later.
    // For Phase 1 (manual logging) these stay empty / 'manual'.
    recordingUrl: { type: String, trim: true, default: '' },
    provider: { type: String, trim: true, default: 'manual' },
    providerCallId: { type: String, trim: true, default: '' },

    calledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

callLogSchema.index({ leadId: 1, createdAt: -1 });

module.exports = mongoose.model('CallLog', callLogSchema);
module.exports.CALL_OUTCOMES = CALL_OUTCOMES;
