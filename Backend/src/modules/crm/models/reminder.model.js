const mongoose = require('mongoose');
const { REFERENCE_TYPE_VALUES } = require('../../../constants/referenceTypes');
const { REMINDER_STATUS_VALUES, REMINDER_STATUS } = require('../../../constants/statuses');

const reminderSchema = new mongoose.Schema(
  {
    referenceType: { type: String, enum: REFERENCE_TYPE_VALUES, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, default: '', maxlength: 2000 },

    reminderDate: { type: Date, required: true },
    reminderTime: { type: String, trim: true, default: '' },
    reminderAt: { type: Date, required: true, index: true },

    status: {
      type: String,
      enum: REMINDER_STATUS_VALUES,
      default: REMINDER_STATUS.PENDING,
      index: true,
    },
    completedAt: { type: Date, default: null },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Last time an overdue notification was sent (throttles the cron to ~daily).
    overdueNotifiedAt: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

reminderSchema.index({ assignedTo: 1, status: 1, reminderAt: 1 });
reminderSchema.index({ referenceType: 1, referenceId: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
