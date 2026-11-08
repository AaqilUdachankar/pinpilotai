import { Agenda } from 'agenda';
import mongoose from 'mongoose';
import Pin from '../models/Pin.js';
import Campaign from '../models/Campaign.js';
import ScheduledJob from '../models/ScheduledJob.js';
import ActivityLog from '../models/ActivityLog.js';
import { publishPinToPinterest } from './pinterestService.js';
import { logger } from '../utils/logger.js';

let agendaInstance = null;
let watchdogInterval = null;

export const initScheduler = async (mongoUri = null) => {
  logger.info('Initializing persistent MongoDB background scheduler...');

  // Start the persistent MongoDB Watchdog immediately (100% reliable, zero delay)
  startWatchdogScheduler();

  // Try Agenda initialization with timeout safety
  try {
    const db = mongoose.connection.db;
    if (db && mongoose.connection.readyState === 1) {
      const agendaPromise = (async () => {
        const agenda = new Agenda();
        agenda.mongo(db, 'agendaJobs');
        agenda.processEvery('30 seconds');
        agenda.maxConcurrency(10);
        agenda.defaultConcurrency(5);

        agenda.define('publish-pinterest-pin', async (job) => {
          const { pinId, campaignId, userId, retryCount = 0 } = job.attrs.data;
          logger.info(`Agenda executing scheduled publishing job for pin ${pinId}...`);
          await executePinPublishing({ pinId, campaignId, userId, retryCount });
        });

        await agenda.start();
        return agenda;
      })();

      // 3 second timeout for Agenda startup
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Agenda start timed out')), 3000));
      agendaInstance = await Promise.race([agendaPromise, timeoutPromise]);
      logger.info('Agenda persistent scheduler started successfully.');
    }
  } catch (error) {
    logger.info(`Persistent MongoDB queue active (standalone mode: ${error.message}).`);
  }

  // Recover pending/missed jobs on startup from MongoDB
  await recoverPendingJobs();

  return agendaInstance;
};

/**
 * Watchdog interval that polls MongoDB for due pins every 30 seconds
 */
const startWatchdogScheduler = () => {
  if (watchdogInterval) clearInterval(watchdogInterval);
  watchdogInterval = setInterval(async () => {
    try {
      await checkAndProcessDuePins();
    } catch (err) {
      logger.error('Watchdog cycle error:', err.message);
    }
  }, 30000);
  logger.info('Persistent 30s MongoDB background job processor running 24/7.');
};

/**
 * Schedule a pin for publishing at a specific Date
 */
export const schedulePin = async ({ pinId, campaignId, userId, publishDate }) => {
  const pin = await Pin.findById(pinId);
  if (!pin) {
    throw new Error(`Pin not found: ${pinId}`);
  }

  const dateObj = new Date(publishDate);

  // Update Pin record
  pin.scheduledAt = dateObj;
  pin.publishingStatus = 'scheduled';
  await pin.save();

  // Create or update persistent ScheduledJob in MongoDB
  let scheduledJob = await ScheduledJob.findOne({ pinId });
  if (!scheduledJob) {
    scheduledJob = new ScheduledJob({
      pinId,
      campaignId,
      userId,
      scheduledAt: dateObj,
      jobStatus: 'pending',
    });
  } else {
    scheduledJob.scheduledAt = dateObj;
    scheduledJob.jobStatus = 'pending';
    scheduledJob.retryCount = 0;
    scheduledJob.lastError = null;
  }

  // Schedule in Agenda if active
  if (agendaInstance) {
    try {
      await agendaInstance.cancel({ 'data.pinId': pinId.toString() });
      const agendaJob = agendaInstance.create('publish-pinterest-pin', {
        pinId: pinId.toString(),
        campaignId: campaignId.toString(),
        userId: userId.toString(),
      });
      agendaJob.schedule(dateObj);
      await agendaJob.save();
      scheduledJob.agendaJobId = agendaJob.attrs._id.toString();
    } catch (agendaErr) {
      // Handled persistently by ScheduledJobs collection
    }
  }

  await scheduledJob.save();

  // Log activity
  await ActivityLog.create({
    userId,
    campaignId,
    pinId,
    action: 'PIN_SCHEDULED',
    status: 'info',
    message: `Pin "${pin.title.substring(0, 40)}..." scheduled for ${dateObj.toISOString()}`,
    details: { scheduledAt: dateObj },
  });

  return scheduledJob;
};

/**
 * Core publishing executor with duplicate prevention and retry logic
 */
export const executePinPublishing = async ({ pinId, campaignId, userId, retryCount = 0 }) => {
  // ATOMIC LOCK: Only proceed if pin is still 'scheduled' or 'failed' (prevents duplicate publishing)
  const pin = await Pin.findOneAndUpdate(
    {
      _id: pinId,
      publishingStatus: { $in: ['scheduled', 'failed'] },
    },
    {
      $set: { publishingStatus: 'publishing' },
    },
    { new: true }
  );

  if (!pin) {
    logger.warn(`Pin ${pinId} is already publishing, published, or paused. Skipping.`);
    return;
  }

  // Update ScheduledJob status to running
  await ScheduledJob.findOneAndUpdate(
    { pinId },
    { $set: { jobStatus: 'running' } }
  );

  try {
    // Check if campaign is paused
    const campaign = await Campaign.findById(campaignId);
    if (campaign && campaign.campaignStatus === 'paused') {
      logger.info(`Campaign ${campaignId} is paused. Reverting pin ${pinId} to paused.`);
      pin.publishingStatus = 'paused';
      await pin.save();
      await ScheduledJob.findOneAndUpdate({ pinId }, { $set: { jobStatus: 'cancelled' } });
      return;
    }

    const boardId = pin.pinterestBoardId || campaign?.selectedBoard?.id;

    // Publish to official Pinterest API v5
    const publishResult = await publishPinToPinterest({
      userId,
      boardId,
      title: pin.title,
      description: pin.description,
      affiliateUrl: pin.affiliateUrl, // User's submitted affiliate link
      imageUrl: pin.imageUrl,
    });

    // Mark as published!
    pin.publishingStatus = 'published';
    pin.publishedAt = new Date();
    pin.pinterestPinId = publishResult.pinterestPinId;
    pin.pinterestBoardId = publishResult.boardId;
    pin.lastError = null;
    await pin.save();

    // Update ScheduledJob
    await ScheduledJob.findOneAndUpdate(
      { pinId },
      {
        $set: {
          jobStatus: 'completed',
          executedAt: new Date(),
          lastError: null,
        },
      }
    );

    // Update campaign stats
    await updateCampaignStats(campaignId);

    // Log success
    await ActivityLog.create({
      userId,
      campaignId,
      pinId,
      action: 'PIN_PUBLISHED',
      status: 'success',
      message: `Pin successfully published to Pinterest! Board: ${boardId}`,
      details: {
        pinterestPinId: publishResult.pinterestPinId,
        url: publishResult.url,
        affiliateUrl: pin.affiliateUrl,
      },
    });

    logger.info(`Pin ${pinId} successfully published to Pinterest (Pin ID: ${publishResult.pinterestPinId})`);
  } catch (error) {
    logger.error(`Failed to publish pin ${pinId}:`, error.message);

    const newRetryCount = (pin.retryCount || 0) + 1;
    const maxRetries = 3;

    const isRateLimit = error.statusCode === 429;
    const isRetryable = isRateLimit || error.statusCode >= 500 || !error.statusCode;

    if (isRetryable && newRetryCount <= maxRetries) {
      const delayMinutes = Math.pow(3, newRetryCount) * 1.5;
      const nextRunDate = new Date(Date.now() + delayMinutes * 60 * 1000);

      logger.info(`Scheduling retry #${newRetryCount} for pin ${pinId} at ${nextRunDate.toISOString()}`);

      pin.publishingStatus = 'scheduled';
      pin.retryCount = newRetryCount;
      pin.scheduledAt = nextRunDate;
      pin.lastError = `Temporary failure: ${error.message}. Retrying at ${nextRunDate.toLocaleTimeString()}`;
      await pin.save();

      await ScheduledJob.findOneAndUpdate(
        { pinId },
        {
          $set: {
            jobStatus: 'pending',
            scheduledAt: nextRunDate,
            retryCount: newRetryCount,
            lastError: error.message,
          },
        }
      );

      await ActivityLog.create({
        userId,
        campaignId,
        pinId,
        action: 'PIN_PUBLISH_RETRY',
        status: 'warning',
        message: `Publishing retry #${newRetryCount} scheduled: ${error.message}`,
        details: { nextRunDate, error: error.message },
      });
    } else {
      // Mark as failed
      pin.publishingStatus = 'failed';
      pin.retryCount = newRetryCount;
      pin.lastError = error.message;
      await pin.save();

      await ScheduledJob.findOneAndUpdate(
        { pinId },
        {
          $set: {
            jobStatus: 'failed',
            lastError: error.message,
          },
        }
      );

      await updateCampaignStats(campaignId);

      await ActivityLog.create({
        userId,
        campaignId,
        pinId,
        action: 'PIN_PUBLISH_FAILED',
        status: 'error',
        message: `Pin publishing failed: ${error.message}`,
        details: { error: error.message, pinterestError: error.pinterestError },
      });
    }
  }
};

/**
 * Update campaign stats counters
 */
export const updateCampaignStats = async (campaignId) => {
  if (!campaignId) return;
  try {
    const total = await Pin.countDocuments({ campaignId });
    const published = await Pin.countDocuments({ campaignId, publishingStatus: 'published' });
    const scheduled = await Pin.countDocuments({ campaignId, publishingStatus: 'scheduled' });
    const failed = await Pin.countDocuments({ campaignId, publishingStatus: 'failed' });

    let campaignStatus = 'active';
    if (published === total && total > 0) {
      campaignStatus = 'completed';
    } else if (scheduled === 0 && failed > 0 && published === 0) {
      campaignStatus = 'failed';
    }

    await Campaign.findByIdAndUpdate(campaignId, {
      'stats.totalPinsCount': total,
      'stats.publishedCount': published,
      'stats.scheduledCount': scheduled,
      'stats.failedCount': failed,
      ...(campaignStatus === 'completed' ? { campaignStatus } : {}),
    });
  } catch (err) {
    logger.warn(`Could not update campaign stats: ${err.message}`);
  }
};

/**
 * Startup recovery: find any scheduled jobs that were missed or pending
 */
export const recoverPendingJobs = async () => {
  try {
    logger.info('Checking for pending scheduled pins to recover after startup...');
    const now = new Date();

    const pendingJobs = await ScheduledJob.find({
      jobStatus: 'pending',
    }).populate('pinId');

    logger.info(`Found ${pendingJobs.length} persistent scheduled jobs in database.`);

    for (const job of pendingJobs) {
      if (!job.pinId) {
        await ScheduledJob.deleteOne({ _id: job._id });
        continue;
      }

      if (new Date(job.scheduledAt) <= now) {
        logger.info(`Job for pin ${job.pinId._id} is past due. Processing now...`);
        executePinPublishing({
          pinId: job.pinId._id,
          campaignId: job.campaignId,
          userId: job.userId,
          retryCount: job.retryCount,
        }).catch((err) => logger.error(`Recovery execution error for ${job.pinId._id}:`, err));
      }
    }
  } catch (err) {
    logger.error('Error recovering pending jobs:', err.message);
  }
};

/**
 * Watchdog scanner: checks for pins whose scheduledAt <= now that are still 'scheduled'
 */
const checkAndProcessDuePins = async () => {
  const now = new Date();
  const duePins = await Pin.find({
    publishingStatus: 'scheduled',
    scheduledAt: { $lte: now },
  }).limit(5);

  for (const pin of duePins) {
    logger.info(`Watchdog detected due pin: ${pin._id} (Scheduled at: ${pin.scheduledAt}). Processing...`);
    executePinPublishing({
      pinId: pin._id,
      campaignId: pin.campaignId,
      userId: pin.userId,
      retryCount: pin.retryCount,
    }).catch((err) => logger.error(`Watchdog run error for pin ${pin._id}:`, err));
  }
};

/**
 * Pause all scheduled pins for a campaign
 */
export const pauseCampaignJobs = async (campaignId) => {
  await Campaign.findByIdAndUpdate(campaignId, { campaignStatus: 'paused' });
  await Pin.updateMany(
    { campaignId, publishingStatus: 'scheduled' },
    { $set: { publishingStatus: 'paused' } }
  );
  await ScheduledJob.updateMany(
    { campaignId, jobStatus: 'pending' },
    { $set: { jobStatus: 'cancelled' } }
  );
};

/**
 * Resume all paused pins for a campaign
 */
export const resumeCampaignJobs = async (campaignId) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  campaign.campaignStatus = 'active';
  await campaign.save();

  const pausedPins = await Pin.find({ campaignId, publishingStatus: 'paused' }).sort({ scheduledAt: 1 });
  let nextTime = new Date();

  for (let i = 0; i < pausedPins.length; i++) {
    const pin = pausedPins[i];
    const publishDate = new Date(nextTime.getTime() + i * (campaign.publishingInterval || 60) * 60 * 1000);
    await schedulePin({
      pinId: pin._id,
      campaignId,
      userId: campaign.userId,
      publishDate,
    });
  }
};
