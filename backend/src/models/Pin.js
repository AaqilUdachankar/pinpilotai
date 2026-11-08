import mongoose from 'mongoose';

const pinSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100, // Pinterest API limit
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 800, // Pinterest API limit is 500-800 characters
  },
  caption: {
    type: String,
    default: '',
  },
  keywords: [{
    type: String,
  }],
  hashtags: [{
    type: String,
  }],
  callToAction: {
    type: String,
    default: 'Visit Site',
  },
  affiliateUrl: {
    type: String,
    required: true,
    trim: true,
  },
  creativeConcept: {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    visualTheme: { type: String, default: '' },
  },
  conceptIndex: {
    type: Number,
    default: 1,
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  pinterestPinId: {
    type: String,
    default: null,
    index: true,
  },
  pinterestBoardId: {
    type: String,
    default: null,
  },
  publishingStatus: {
    type: String,
    enum: ['draft', 'scheduled', 'publishing', 'published', 'failed', 'paused'],
    default: 'scheduled',
    index: true,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  lastError: {
    type: String,
    default: null,
  },
  analytics: {
    impressions: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    outboundClicks: { type: Number, default: 0 },
    pinClicks: { type: Number, default: 0 },
    metricsAvailable: { type: Boolean, default: false },
    lastFetchedAt: { type: Date, default: null },
  },
  // Verification Checklist After Each Publish
  publishChecklist: {
    affiliateLinkVerified: { type: Boolean, default: false },
    pinterestPinVerified: { type: Boolean, default: false },
    boardAttached: { type: Boolean, default: false },
    ftcDisclosurePresent: { type: Boolean, default: false },
    creativeDelivered: { type: Boolean, default: false },
    seoTagsIndexed: { type: Boolean, default: false },
    nextInQueueArmed: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    status: { type: String, default: 'pending' }, // pending, passed, warning, failed
    notes: { type: String, default: '' },
  },
}, {
  timestamps: true,
});

pinSchema.index({ scheduledAt: 1, publishingStatus: 1 });
pinSchema.index({ userId: 1, publishingStatus: 1 });

const Pin = mongoose.model('Pin', pinSchema);
export default Pin;
