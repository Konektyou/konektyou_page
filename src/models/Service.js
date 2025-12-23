import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      default: 'per hour',
      enum: ['per hour', 'per day', 'per session', 'fixed']
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      default: null
    },
    category: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for faster queries
ServiceSchema.index({ providerId: 1, active: 1 });
ServiceSchema.index({ categoryId: 1 });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);

