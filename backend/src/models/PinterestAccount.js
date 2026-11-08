import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/crypto.js';

const boardSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  privacy: { type: String, default: 'PUBLIC' },
  pinCount: { type: Number, default: 0 },
  followerCount: { type: Number, default: 0 },
}, { _id: false });

const pinterestAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  pinterestUserId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    default: '',
  },
  accountType: {
    type: String,
    default: 'BUSINESS',
  },
  profileImage: {
    type: String,
    default: '',
  },
  websiteUrl: {
    type: String,
    default: '',
  },
  // Encrypted tokens
  accessTokenEncrypted: {
    type: String,
    required: true,
  },
  refreshTokenEncrypted: {
    type: String,
    default: null,
  },
  tokenExpiry: {
    type: Date,
    default: null,
  },
  scopes: [{
    type: String,
  }],
  connectedBoards: [boardSchema],
  defaultBoardId: {
    type: String,
    default: null,
  },
  isConnected: {
    type: Boolean,
    default: true,
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Methods to get and set decrypted tokens
pinterestAccountSchema.methods.getAccessToken = function () {
  return decrypt(this.accessTokenEncrypted);
};

pinterestAccountSchema.methods.setAccessToken = function (token) {
  this.accessTokenEncrypted = encrypt(token);
};

pinterestAccountSchema.methods.getRefreshToken = function () {
  return decrypt(this.refreshTokenEncrypted);
};

pinterestAccountSchema.methods.setRefreshToken = function (token) {
  if (!token) {
    this.refreshTokenEncrypted = null;
  } else {
    this.refreshTokenEncrypted = encrypt(token);
  }
};

// Safe output without exposing encrypted tokens directly
pinterestAccountSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.accessTokenEncrypted;
  delete obj.refreshTokenEncrypted;
  return obj;
};

const PinterestAccount = mongoose.model('PinterestAccount', pinterestAccountSchema);
export default PinterestAccount;
