const mongoose = require('mongoose');

const PROJECT_STATUS = ['ongoing', 'upcoming', 'completed'];

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    location: { type: String, trim: true, default: '' },
    propertyType: { type: String, trim: true, default: '' },
    status: { type: String, enum: PROJECT_STATUS, default: 'ongoing', index: true },
    description: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
module.exports.PROJECT_STATUS = PROJECT_STATUS;
