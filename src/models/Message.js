import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true
    },
    sender: {
      type: String,
      enum: ['provider', 'client'],
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Compound index for faster queries
MessageSchema.index({ providerId: 1, clientId: 1, createdAt: -1 });
MessageSchema.index({ providerId: 1, createdAt: -1 });
MessageSchema.index({ clientId: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);

