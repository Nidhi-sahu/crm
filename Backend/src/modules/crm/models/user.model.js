const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    event: { type: String, enum: ['login', 'logout'], default: 'login' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true, default: '' },
    passwordHash: { type: String, required: true, select: false },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
      index: true,
    },
    additionalRoleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    additionalPermissions: [{ type: String, trim: true }],
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    lastLoginAt: { type: Date, default: null },
    loginHistory: { type: [loginHistorySchema], default: [] },

    // Broker-only fields: which sales/visit user manages this broker.
    // Used to filter Brokers list visibility (only managers see their brokers).
    managedBySalesId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    managedByVisitId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    // 48-hour inactivity lock — admin must unlock before the user can log in again.
    isLocked: { type: Boolean, default: false, index: true },
    lockReason: { type: String, default: '' },
    lockedAt: { type: Date, default: null },
    unlockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    unlockedAt: { type: Date, default: null },
    passwordResetToken: { type: String, select: false, default: null },
    passwordResetExpires: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
