import mongoose from 'mongoose';

const ProviderBankAccountSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      unique: true,
      index: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },
    accountHolderName: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for faster queries
ProviderBankAccountSchema.index({ providerId: 1 });

export default mongoose.models.ProviderBankAccount || mongoose.model('ProviderBankAccount', ProviderBankAccountSchema);

