const mongoose = require('mongoose');

const PROJECT_STATUS = ['ongoing', 'upcoming', 'completed'];

const ACCOUNT_TYPES = ['Savings', 'Current'];

const bankDetailsSchema = new mongoose.Schema(
  {
    bankName: { type: String, trim: true, default: '' },
    accountHolderName: { type: String, trim: true, default: '' },
    accountNumber: { type: String, trim: true, default: '' },
    ifscCode: { type: String, trim: true, uppercase: true, default: '' },
    branch: { type: String, trim: true, default: '' },
    accountType: { type: String, enum: ['', ...ACCOUNT_TYPES], default: '' },
    upiId: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    location: { type: String, trim: true, default: '' },
    propertyType: { type: String, trim: true, default: '' },
    status: { type: String, enum: PROJECT_STATUS, default: 'ongoing', index: true },
    description: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    // Geo-coordinates of the site/project — used for Visit Form location check.
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    bankDetails: { type: bankDetailsSchema, default: () => ({}) },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
module.exports.PROJECT_STATUS = PROJECT_STATUS;
module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;
