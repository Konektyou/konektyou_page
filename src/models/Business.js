import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BusinessSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    businessName: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    province: {
      type: String,
      default: ''
    },
    postalCode: {
      type: String,
      default: ''
    },
    // Verification status
    isVerified: {
      type: Boolean,
      default: false
    },
    // Account status
    isActive: {
      type: Boolean,
      default: true
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    banReason: {
      type: String
    },
    // Email verification
    emailVerificationOTP: {
      type: String
    },
    emailVerificationOTPExpires: {
      type: Date
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    // Password reset
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    lastLogin: {
      type: Date
    }
  },
  { timestamps: true }
);

// Hash password before saving
BusinessSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
BusinessSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);

