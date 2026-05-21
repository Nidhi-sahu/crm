const mongoose = require('mongoose');
const { REFERENCE_TYPE_VALUES } = require('../../../constants/referenceTypes');
const { NOTIFICATION_TYPE_VALUES, NOTIFICATION_TYPE } = require('../../../constants/notificationTypes');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    type: {
      type: String,
      enum: NOTIFICATION_TYPE_VALUES,
      default: NOTIFICATION_TYPE.SYSTEM,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, trim: true, default: '', maxlength: 1000 },

    referenceType: { type: String, enum: [...REFERENCE_TYPE_VALUES, 'reminder'], default: null },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },

    meta: { type: mongoose.Schema.Types.Mixed, default: {} },

    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
