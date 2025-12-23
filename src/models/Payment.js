import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    paymentType: {
      type: String,
      enum: ['earned', 'payout', 'refund'],
      default: 'earned'
    },
    description: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Indexes for faster queries
PaymentSchema.index({ providerId: 1, status: 1 });
PaymentSchema.index({ providerId: 1, createdAt: -1 });
PaymentSchema.index({ bookingId: 1 });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

