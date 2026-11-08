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
    required: [true, 'Password is required'],
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
  settings: {
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
