import Pin from '../models/Pin.js';
import Campaign from '../models/Campaign.js';
import ActivityLog from '../models/ActivityLog.js';
import PinterestAccount from '../models/PinterestAccount.js';

export const getOverviewStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalCampaigns = await Campaign.countDocuments({ userId });
    const totalPins = await Pin.countDocuments({ userId });
    const publishedPins = await Pin.countDocuments({ userId, publishingStatus: 'published' });
    const scheduledPins = await Pin.countDocuments({ userId, publishingStatus: 'scheduled' });
    const failedPins = await Pin.countDocuments({ userId, publishingStatus: 'failed' });

    // Aggregate Pin metrics
    const metricsAggregation = await Pin.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: '$analytics.impressions' },
          totalOutboundClicks: { $sum: '$analytics.outboundClicks' },
          totalSaves: { $sum: '$analytics.saves' },
          totalPinClicks: { $sum: '$analytics.pinClicks' },
          metricsReportedCount: {
            $sum: { $cond: [{ $eq: ['$analytics.metricsAvailable', true] }, 1, 0] },
          },
        },
      },
    ]);

    const metrics = metricsAggregation[0] || {
      totalImpressions: 0,
      totalOutboundClicks: 0,
      totalSaves: 0,
      totalPinClicks: 0,
      metricsReportedCount: 0,
    };

    // Pinterest connection status
    const pinterestAccount = await PinterestAccount.findOne({ userId, isConnected: true });

    // Recent activity
    const recentActivity = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('campaignId', 'campaignName')
      .populate('pinId', 'title imageUrl');

    // Upcoming scheduled queue (next 5 pins)
    const upcomingPins = await Pin.find({
      userId,
      publishingStatus: 'scheduled',
    })
      .sort({ scheduledAt: 1 })
      .limit(6)
      .populate('campaignId', 'campaignName selectedBoard');

    // Status breakdown for donut / pie chart
    const statusDistribution = [
      { name: 'Published', value: publishedPins, color: '#10B981' },
      { name: 'Scheduled', value: scheduledPins, color: '#3B82F6' },
      { name: 'Failed', value: failedPins, color: '#EF4444' },
    ];

    res.json({
      success: true,
      stats: {
        totalCampaigns,
        totalPins,
        publishedPins,
        scheduledPins,
        failedPins,
        totalImpressions: metrics.totalImpressions,
        totalOutboundClicks: metrics.totalOutboundClicks,
        totalSaves: metrics.totalSaves,
        totalPinClicks: metrics.totalPinClicks,
        metricsAvailable: metrics.metricsReportedCount > 0,
        pinterestConnected: !!pinterestAccount,
      },
      statusDistribution,
      recentActivity,
      upcomingPins,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCampaignAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { campaignId } = req.params;

    const campaign = await Campaign.findOne({ _id: campaignId, userId });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const pins = await Pin.find({ campaignId, userId }).sort({ conceptIndex: 1 });

    const totalImpressions = pins.reduce((acc, p) => acc + (p.analytics?.impressions || 0), 0);
    const totalClicks = pins.reduce((acc, p) => acc + (p.analytics?.outboundClicks || 0), 0);
    const totalSaves = pins.reduce((acc, p) => acc + (p.analytics?.saves || 0), 0);

    // Concept breakdown
    const conceptBreakdown = pins.map((p) => ({
      conceptIndex: p.conceptIndex,
      name: p.creativeConcept?.name || `Pin #${p.conceptIndex}`,
      title: p.title,
      status: p.publishingStatus,
      impressions: p.analytics?.impressions || 0,
      clicks: p.analytics?.outboundClicks || 0,
      saves: p.analytics?.saves || 0,
      metricsAvailable: !!p.analytics?.metricsAvailable,
    }));

    res.json({
      success: true,
      campaign,
      totalImpressions,
      totalClicks,
      totalSaves,
      conceptBreakdown,
      pins,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopPerformingPins = async (req, res) => {
  try {
    const userId = req.user._id;

    const topPins = await Pin.find({
      userId,
      publishingStatus: 'published',
    })
      .sort({ 'analytics.outboundClicks': -1, 'analytics.impressions': -1 })
      .limit(8)
      .populate('campaignId', 'campaignName');

    res.json({
      success: true,
      topPins,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
