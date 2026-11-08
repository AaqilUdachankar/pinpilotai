import ScheduledJob from '../models/ScheduledJob.js';
import Pin from '../models/Pin.js';
import { pauseCampaignJobs, resumeCampaignJobs } from '../services/schedulerService.js';

export const getSchedulerJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 50 } = req.query;

    const query = { userId };
    if (status && status !== 'all') {
      query.jobStatus = status;
    }

    const jobs = await ScheduledJob.find(query)
      .populate('pinId', 'title imageUrl publishingStatus scheduledAt affiliateUrl')
      .populate('campaignId', 'campaignName selectedBoard')
      .sort({ scheduledAt: 1 })
      .limit(Number(limit));

    const totalPending = await ScheduledJob.countDocuments({ userId, jobStatus: 'pending' });
    const totalRunning = await ScheduledJob.countDocuments({ userId, jobStatus: 'running' });
    const totalCompleted = await ScheduledJob.countDocuments({ userId, jobStatus: 'completed' });
    const totalFailed = await ScheduledJob.countDocuments({ userId, jobStatus: 'failed' });

    res.json({
      success: true,
      stats: {
        pending: totalPending,
        running: totalRunning,
        completed: totalCompleted,
        failed: totalFailed,
      },
      jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pauseScheduler = async (req, res) => {
  try {
    const { campaignId } = req.body;
    if (!campaignId) {
      return res.status(400).json({ success: false, message: 'Campaign ID is required to pause scheduler' });
    }

    await pauseCampaignJobs(campaignId);

    res.json({
      success: true,
      message: 'Campaign scheduling paused.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resumeScheduler = async (req, res) => {
  try {
    const { campaignId } = req.body;
    if (!campaignId) {
      return res.status(400).json({ success: false, message: 'Campaign ID is required to resume scheduler' });
    }

    await resumeCampaignJobs(campaignId);

    res.json({
      success: true,
      message: 'Campaign scheduling resumed and pending pins queued.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSchedulerHealth = async (req, res) => {
  try {
    const nextJob = await ScheduledJob.findOne({
      userId: req.user._id,
      jobStatus: 'pending',
      scheduledAt: { $gte: new Date() },
    }).sort({ scheduledAt: 1 });

    res.json({
      success: true,
      status: 'operational',
      engine: 'Agenda Persistent MongoDB Engine',
      nextScheduledRun: nextJob ? nextJob.scheduledAt : null,
      serverTime: new Date(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
