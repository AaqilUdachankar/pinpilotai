import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  passwordHash: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
    default: null,
    sparse: true,
    index: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  pinterestAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PinterestAccount',
    default: null,
  },
  // Optional custom user API keys
  apiKeys: {
    geminiApiKey: { type: String, default: '' },
    openaiApiKey: { type: String, default: '' },
    cloudinaryCloudName: { type: String, default: '' },
    cloudinaryApiKey: { type: String, default: '' },
    cloudinaryApiSecret: { type: String, default: '' },
    pinterestClientId: { type: String, default: '' },
    pinterestClientSecret: { type: String, default: '' },
  },
  // AI API Usage & Quota Tracking
  apiUsage: {
    gemini: {
      requestsCount: { type: Number, default: 0 },
      tokensUsed: { type: Number, default: 0 },
      limitRequests: { type: Number, default: 1500 }, // Standard daily RPM/quota baseline
      lastUsedAt: { type: Date, default: null },
    },
    openai: {
      requestsCount: { type: Number, default: 0 },
      tokensUsed: { type: Number, default: 0 },
      limitRequests: { type: Number, default: 1000 },
      estimatedCostUsd: { type: Number, default: 0 },
      lastUsedAt: { type: Date, default: null },
    },
  },
  settings: {
    enableAffiliateDisclosure: {
      type: Boolean,
      default: false, // Optional by default. When Compulsory is toggled ON, posts disclosure text.
    },
    defaultAffiliateDisclosure: {
      type: String,
      default: 'Affiliate link – I may earn a commission from qualifying purchases at no extra cost to you.',
    },
    defaultCallToAction: {
      type: String,
      default: 'Visit Site',
    },
    defaultPublishingInterval: {
      type: Number,
      default: 60, // in minutes
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    autoChainCampaigns: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

// Compare password helper
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Safe JSON serialization
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  if (obj.apiKeys) {
    if (obj.apiKeys.cloudinaryApiSecret) obj.apiKeys.cloudinaryApiSecret = '••••••••';
    if (obj.apiKeys.pinterestClientSecret) obj.apiKeys.pinterestClientSecret = '••••••••';
    if (obj.apiKeys.geminiApiKey) obj.apiKeys.geminiApiKey = obj.apiKeys.geminiApiKey.substring(0, 4) + '••••••••';
    if (obj.apiKeys.openaiApiKey) obj.apiKeys.openaiApiKey = obj.apiKeys.openaiApiKey.substring(0, 4) + '••••••••';
  }
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
