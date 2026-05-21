const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    module: { type: String, required: true, trim: true, index: true },
    action: { type: String, required: true, trim: true, index: true },

    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    performedByEmail: { type: String, trim: true, default: '' },

    refType: { type: String, trim: true, default: null },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },

    oldData: { type: mongoose.Schema.Types.Mixed, default: null },
    newData: { type: mongoose.Schema.Types.Mixed, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },

    ipAddress: { type: String, trim: true, default: '' },
    userAgent: { type: String, trim: true, default: '' },

    success: { type: Boolean, default: true },
    errorMessage: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ refType: 1, refId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
