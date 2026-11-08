import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  campaignName: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
  },
  affiliateUrl: {
    type: String,
    required: [true, 'Affiliate URL is required'],
    trim: true,
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  productDescription: {
    type: String,
    default: '',
  },
  productCategory: {
    type: String,
    default: 'General',
  },
  brand: {
    type: String,
    default: '',
  },
  features: [{
    type: String,
  }],
  price: {
    type: String,
    default: '',
  },
  totalPins: {
    type: Number,
    default: 10,
    min: 1,
    max: 20,
  },
  publishingInterval: {
    type: Number,
    default: 60, // in minutes (default 1 hour)
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  selectedBoard: {
    id: { type: String, default: null },
    name: { type: String, default: null },
  },
  campaignStatus: {
    type: String,
    enum: ['draft', 'generating', 'scheduled', 'active', 'paused', 'completed', 'failed'],
    default: 'draft',
    index: true,
  },
  imageStyle: {
    type: String,
    default: 'commercial-product-aesthetic', // aesthetic, vibrant, minimal, luxury, lifestyle
  },
  customInstructions: {
    type: String,
    default: '',
  },
  rawExtractedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  generationProgress: {
    step: { type: String, default: 'idle' },
    percentage: { type: Number, default: 0 },
    message: { type: String, default: '' },
    error: { type: String, default: null },
  },
  stats: {
    totalPinsCount: { type: Number, default: 0 },
    publishedCount: { type: Number, default: 0 },
    scheduledCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

campaignSchema.index({ userId: 1, createdAt: -1 });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
