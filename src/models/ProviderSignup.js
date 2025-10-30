'use server';

import mongoose from 'mongoose';

const ProviderSignupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    serviceType: { type: String, required: true },
    experience: { type: String, required: true },
    area: { type: String, required: true },
    businessName: { type: String },
    documents: { type: [String], default: [] },
    photoName: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.ProviderSignup || mongoose.model('ProviderSignup', ProviderSignupSchema);


