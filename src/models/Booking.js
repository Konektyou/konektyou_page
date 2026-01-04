import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    startTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // Duration in hours
      required: true,
      min: 0.5
    },
    endTime: {
      type: Date,
      required: true
    },
    workLocation: {
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      province: {
        type: String,
        required: true
      },
      postalCode: {
        type: String,
        default: ''
      },
      coordinates: {
        lat: {
          type: Number,
          default: null
        },
        lng: {
          type: Number,
          default: null
        }
      }
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    baseAmount: {
      type: Number,
      default: null // Provider's base price (before tax)
    },
    taxAmount: {
      type: Number,
      default: null // Tax amount
    },
    taxRate: {
      type: Number,
      default: null // Tax rate at time of booking
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentIntentId: {
      type: String,
      default: null
    },
    stripePaymentId: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancelledBy: {
      type: String,
      enum: ['client', 'provider', 'system'],
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    review: {
      type: String,
      default: null
    },
    ratedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Indexes for faster queries
BookingSchema.index({ clientId: 1, status: 1 });
BookingSchema.index({ providerId: 1, status: 1 });
BookingSchema.index({ startTime: 1 });
BookingSchema.index({ status: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

