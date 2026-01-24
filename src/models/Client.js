import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ClientSchema = new mongoose.Schema(
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
    },
    // Subscription
    subscription: {
      planType: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'expired', 'cancelled'],
        default: 'inactive'
      },
      startDate: {
        type: Date
      },
      endDate: {
        type: Date
      },
      amount: {
        type: Number,
        default: 0
      },
      stripeSubscriptionId: {
        type: String
      },
      stripeCustomerId: {
        type: String
      }
    }
  },
  { timestamps: true }
);

// Hash password before saving
ClientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
ClientSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Client || mongoose.model('Client', ClientSchema);

