import mongoose from 'mongoose';

const scheduledJobSchema = new mongoose.Schema({
  pinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pin',
    required: true,
    unique: true,
    index: true,
  },
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
  agendaJobId: {
    type: String,
    default: null,
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true,
  },
  jobStatus: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  maxRetries: {
    type: Number,
    default: 3,
  },
  lastError: {
    type: String,
    default: null,
  },
  executedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

scheduledJobSchema.index({ scheduledAt: 1, jobStatus: 1 });

const ScheduledJob = mongoose.model('ScheduledJob', scheduledJobSchema);
export default ScheduledJob;
