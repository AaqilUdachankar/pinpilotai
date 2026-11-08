import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    default: null,
    index: true,
  },
  pinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pin',
    default: null,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  },
  message: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

activityLogSchema.index({ userId: 1, timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
