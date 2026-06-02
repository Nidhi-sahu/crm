const mongoose = require('mongoose');

const STATUS = ['queued', 'sent', 'delivered', 'read', 'failed'];
const TYPES = ['text', 'template'];

const whatsappMessageSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null, index: true },
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', default: null },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    direction: { type: String, enum: ['outbound', 'inbound'], default: 'outbound' },
    toNumber: { type: String, trim: true, default: '' },
    type: { type: String, enum: TYPES, default: 'text' },
    templateName: { type: String, trim: true, default: '' },
    body: { type: String, trim: true, default: '' },
    stageName: { type: String, trim: true, default: '' },

    status: { type: String, enum: STATUS, default: 'queued', index: true },
    providerMessageId: { type: String, trim: true, default: '', index: true },
    errorMessage: { type: String, trim: true, default: '' },

    sentAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

whatsappMessageSchema.index({ leadId: 1, createdAt: -1 });

module.exports = mongoose.model('WhatsappMessage', whatsappMessageSchema);
module.exports.STATUS = STATUS;
module.exports.TYPES = TYPES;
