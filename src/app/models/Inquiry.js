import mongoose from 'mongoose';

const InquiryItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const InquirySchema = new mongoose.Schema({
  company: { type: String, required: true },
  contact: { type: String, required: true },
  items: [InquiryItemSchema],
  createdAt: { type: Date, default: Date.now },
  submitter: { type: String, required: true },
  status: { type: String, enum: ['requested', 'processing', 'complete'], default: 'requested' },
  completedAt: { type: Date },
});

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema); 