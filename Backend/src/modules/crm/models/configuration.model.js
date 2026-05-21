const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
    category: { type: String, trim: true, default: 'general', index: true },
    description: { type: String, trim: true, default: '' },
    isSystem: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Configuration', configurationSchema);
