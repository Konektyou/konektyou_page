import mongoose from 'mongoose';

const AdminSettingsSchema = new mongoose.Schema(
  {
    commissionRate: {
      type: Number,
      default: 10, // Default 10%
      min: 0,
      max: 100,
      required: true
    },
    taxRate: {
      type: Number,
      default: 13, // Default 13% (Canada HST/GST)
      min: 0,
      max: 100,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    }
  },
  { timestamps: true }
);

// Ensure only one settings document exists
AdminSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ commissionRate: 10, taxRate: 13 });
  }
  return settings;
};

export default mongoose.models.AdminSettings || mongoose.model('AdminSettings', AdminSettingsSchema);

