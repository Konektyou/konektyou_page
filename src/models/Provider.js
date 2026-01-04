import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Subdocument schema for documents
const DocumentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  }
}, { _id: true });


const ProviderSchema = new mongoose.Schema(
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
    serviceType: {
      type: String,
      default: ''
    },
    experience: {
      type: String
    },
    area: {
      type: String
    },
    businessName: {
      type: String
    },
    // Profile status - simplified flow
    profileStatus: {
      type: String,
      enum: ['INCOMPLETE', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'INCOMPLETE'
    },
    // Verification status - simplified flow
    verificationStatus: {
      type: String,
      enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NOT_SUBMITTED'
    },
    rejectionReason: {
      type: String
    },
    // Verification status - if approved, provider can work
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
    // Service area (city, province for Canada)
    city: {
      type: String,
      default: ''
    },
    province: {
      type: String,
      default: ''
    },
    // Location coordinates for map-based discovery
    location: {
      latitude: {
        type: Number,
        default: null
      },
      longitude: {
        type: Number,
        default: null
      }
    },
    // Documents
    documents: {
      type: [DocumentSchema],
      default: []
    },
    photoName: {
      type: String,
      default: null
    },
    photoPath: {
      type: String,
      default: null
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
ProviderSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
ProviderSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if provider can work (simplified)
ProviderSchema.methods.canWork = function () {
  return this.isActive && !this.isBanned && this.isVerified && this.profileStatus === 'APPROVED' && this.verificationStatus === 'APPROVED';
};

export default mongoose.models.Provider || mongoose.model('Provider', ProviderSchema);

