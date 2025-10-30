import mongoose from 'mongoose';

const ClientSignupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    service: { type: String, required: true },
    area: { type: String, required: true },
    time: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ClientSignup || mongoose.model('ClientSignup', ClientSignupSchema);


