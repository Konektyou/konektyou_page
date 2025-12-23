import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    action: {
      type: String,
      enum: ['login', 'logout', 'failed_login'],
      required: true
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    success: {
      type: Boolean,
      default: true
    },
    message: {
      type: String
    }
  },
  { timestamps: true }
);

// Index for faster queries
ActivityLogSchema.index({ adminId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);

