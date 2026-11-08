import Pin from '../models/Pin.js';
import Campaign from '../models/Campaign.js';
import ScheduledJob from '../models/ScheduledJob.js';
import ActivityLog from '../models/ActivityLog.js';
import { generateSinglePinImage } from '../services/imageService.js';
import { generateCampaignContent } from '../services/aiService.js';
import { schedulePin, executePinPublishing, updateCampaignStats } from '../services/schedulerService.js';
import { fetchPinAnalytics } from '../services/pinterestService.js';
import { logger } from '../utils/logger.js';

export const getPins = async (req, res) => {
  try {
    const userId = req.user._id;
    const { campaignId, status, limit = 50, page = 1 } = req.query;

    const query = { userId };
    if (campaignId) query.campaignId = campaignId;
    if (status && status !== 'all') query.publishingStatus = status;

    const pins = await Pin.find(query)
      .populate('campaignId', 'campaignName productName affiliateUrl selectedBoard')
      .sort({ scheduledAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Pin.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      pins,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPinById = async (req, res) => {
  try {
    const pin = await Pin.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('campaignId');

    if (!pin) {
      return res.status(404).json({ success: false, message: 'Pin not found.' });
    }

    res.json({ success: true, pin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Returns detailed post-publish verification checklist
 */
export const getPinChecklist = async (req, res) => {
  try {
    const pin = await Pin.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('campaignId', 'campaignName productName appendAffiliateDisclosure');

    if (!pin) {
      return res.status(404).json({ success: false, message: 'Pin not found.' });
    }

    const hasDisclosure = pin.description?.toLowerCase().includes('affiliate') || pin.description?.toLowerCase().includes('commission');
    const isDisclosureRequired = pin.campaignId?.appendAffiliateDisclosure ?? req.user.settings?.enableAffiliateDisclosure ?? false;
    const ftcCheckPassed = isDisclosureRequired ? hasDisclosure : true;

    const checklist = {
      affiliateLinkVerified: pin.publishChecklist?.affiliateLinkVerified ?? !!pin.affiliateUrl,
      pinterestPinVerified: pin.publishChecklist?.pinterestPinVerified ?? !!pin.pinterestPinId,
      boardAttached: pin.publishChecklist?.boardAttached ?? !!pin.pinterestBoardId,
      ftcDisclosurePresent: ftcCheckPassed,
      creativeDelivered: pin.publishChecklist?.creativeDelivered ?? !!pin.imageUrl,
      seoTagsIndexed: pin.publishChecklist?.seoTagsIndexed ?? !!(pin.title && pin.keywords?.length > 0),
      nextInQueueArmed: pin.publishChecklist?.nextInQueueArmed ?? (pin.publishingStatus === 'scheduled'),
      status: pin.publishChecklist?.status || (pin.publishingStatus === 'published' ? 'passed' : pin.publishingStatus === 'failed' ? 'failed' : 'pending'),
      notes: pin.publishChecklist?.notes || '',
    };

    res.json({
      success: true,
      pinId: pin._id,
      pinTitle: pin.title,
      status: pin.publishingStatus,
      checklist,
      affiliateUrl: pin.affiliateUrl,
      pinterestPinId: pin.pinterestPinId,
      pinterestUrl: pin.pinterestPinId ? `https://www.pinterest.com/pin/${pin.pinterestPinId}/` : null,
      publishedAt: pin.publishedAt,
      scheduledAt: pin.scheduledAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Export all scheduled and published pins to Excel / Google Sheets CSV
 */
export const exportPinsCSV = async (req, res) => {
  try {
    const userId = req.user._id;
    const { campaignId } = req.query;

    const query = { userId };
    if (campaignId) query.campaignId = campaignId;

    const pins = await Pin.find(query)
      .populate('campaignId', 'campaignName productName')
      .sort({ scheduledAt: 1 });

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const headers = [
      'Campaign Name',
      'Concept #',
      'Creative Concept',
      'Pin Title',
      'Scheduled Date & Time',
      'Publishing Status',
      'Published Date & Time',
      'Affiliate Destination Link',
      'Pinterest Board ID',
      'Pinterest Pin ID',
      'Pinterest Pin URL',
      'Impressions',
      'Outbound Clicks',
      'Saves',
      'FTC Affiliate Disclosure Included',
      'Image URL',
    ];

    const rows = pins.map((p) => [
      escapeCsv(p.campaignId?.campaignName || 'N/A'),
      p.conceptIndex || 1,
      escapeCsv(p.creativeConcept?.name || 'Showcase'),
      escapeCsv(p.title),
      escapeCsv(p.scheduledAt ? new Date(p.scheduledAt).toISOString() : ''),
      escapeCsv(p.publishingStatus),
      escapeCsv(p.publishedAt ? new Date(p.publishedAt).toISOString() : ''),
      escapeCsv(p.affiliateUrl),
      escapeCsv(p.pinterestBoardId || ''),
      escapeCsv(p.pinterestPinId || ''),
      escapeCsv(p.pinterestPinId ? `https://www.pinterest.com/pin/${p.pinterestPinId}/` : ''),
      p.analytics?.impressions || 0,
      p.analytics?.outboundClicks || 0,
      p.analytics?.saves || 0,
      p.description?.toLowerCase().includes('affiliate') || p.description?.toLowerCase().includes('commission') ? 'YES' : 'NO',
      escapeCsv(p.imageUrl),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const filename = `pinpilot-schedule-export-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePin = async (req, res) => {
  try {
    const { title, description, caption, keywords, hashtags, callToAction, affiliateUrl, pinterestBoardId } = req.body;

    const pin = await Pin.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!pin) {
      return res.status(404).json({ success: false, message: 'Pin not found.' });
    }

    if (title) pin.title = title.substring(0, 100).trim();
    if (description) pin.description = description.substring(0, 800).trim();
    if (caption !== undefined) pin.caption = caption;
    if (keywords) pin.keywords = Array.isArray(keywords) ? keywords : keywords.split(',').map((k) => k.trim());
    if (hashtags) pin.hashtags = Array.isArray(hashtags) ? hashtags : hashtags.split(',').map((h) => h.trim());
    if (callToAction) pin.callToAction = callToAction;
    if (affiliateUrl) pin.affiliateUrl = affiliateUrl.trim();
    if (pinterestBoardId) pin.pinterestBoardId = pinterestBoardId;

    await pin.save();

    await ActivityLog.create({
      userId: req.user._id,
      campaignId: pin.campaignId,
      pinId: pin._id,
      action: 'PIN_UPDATED',
      status: 'info',
      message: `Pin "${pin.title.substring(0, 30)}..." updated by user.`,
    });

    res.json({
      success: true,
      message: 'Pin updated successfully.',
      pin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const regeneratePinImage = async (req, res) => {
  try {
    const pin = await Pin.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('campaignId');

    if (!pin) {
      return res.status(404).json({ success: false, message: 'Pin not found.' });
    }

    const { customPrompt } = req.body;
    const campaign = pin.campaignId;

    const newImage = await generateSinglePinImage({
      productName: campaign?.productName || 'Product',
      brand: campaign?.brand || '',
      category: campaign?.productCategory || 'General',
      concept: {
        conceptIndex: pin.conceptIndex || 1,
        conceptName: pin.creativeConcept?.name || 'Product Showcase',
      },
      customPrompt,
      userApiKeys: req.user.apiKeys,
    });

    pin.imageUrl = newImage.imageUrl;
    pin.cloudinaryPublicId = newImage.cloudinaryPublicId;
    await pin.save();

    await ActivityLog.create({
      userId: req.user._id,
      campaignId: pin.campaignId._id,
      pinId: pin._id,
      action: 'PIN_IMAGE_REGENERATED',
      status: 'success',
      message: `Image regenerated for pin #${pin.conceptIndex}`,
    });

    res.json({
      success: true,
      message: 'Pin image regenerated successfully.',
      pin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const regeneratePinContent = async (req, res) => {
  try {
    const pin = await Pin.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('campaignId');

    if (!pin) {
      return res.status(404).json({ success: false, message: 'Pin not found.' });
    }

    const campaign = pin.campaignId;
    const content = await generateCampaignContent({
      userId: req.user._id,
      productName: campaign?.productName || 'Product',
      productDescription: campaign?.productDescription || '',
      brand: campaign?.brand || '',
      category: campaign?.productCategory || 'General',
      price: campaign?.price || '',
      features: campaign?.features || [],
      affiliateUrl: pin.affiliateUrl,
      customInstructions: req.body?.instructions || '',
      userApiKeys: req.user.apiKeys,
      disclosureText: (campaign?.appendAffiliateDisclosure ?? req.user.settings?.enableAffiliateDisclosure)
        ? (campaign?.affiliateDisclosureText || req.user.settings?.defaultAffiliateDisclosure)
        : '',
    });

    const matchingConcept = content.find((c) => c.conceptIndex === pin.conceptIndex) || content[0];

    pin.title = matchingConcept.pinTitle;
    pin.description = matchingConcept.description;
    pin.caption = matchingConcept.caption;
    pin.keywords = matchingConcept.keywords;
    pin.hashtags = matchingConcept.hashtags;
    pin.callToAction = matchingConcept.callToAction;

    await pin.save();

    await ActivityLog.create({
      userId: req.user._id,
      campaignId: pin.campaignId._id,
      pinId: pin._id,
      action: 'PIN_CONTENT_REGENERATED',
      status: 'success',
      message: `SEO content regenerated for pin #${pin.conceptIndex}`,
    });

    res.json({
      success: true,
      message: 'Pin SEO content regenerated successfully.',
      pin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reschedulePin = async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: 'New scheduled date & time is required.' });
    }

    const pin = await Pin.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!pin) {
      return res.status(404).json({ success: false, message: 'Pin not found.' });
    }

    const newDate = new Date(scheduledAt);
    await schedulePin({
      pinId: pin._id,
      campaignId: pin.campaignId,
      userId: req.user._id,
      publishDate: newDate,
    });

    pin.scheduledAt = newDate;
    pin.publishingStatus = 'scheduled';
    await pin.save();

    res.json({
      success: true,
      message: `Pin rescheduled for ${newDate.toLocaleString()}`,
      pin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const publishPinNow = async (req, res) => {
  try {
    const pin = await Pin.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!pin) {
      return res.status(404).json({ success: false, message: 'Pin not found.' });
    }

    logger.info(`Manual 'Publish Now' triggered for pin ${pin._id}`);

    await executePinPublishing({
      pinId: pin._id,
      campaignId: pin.campaignId,
      userId: req.user._id,
    });

    const updatedPin = await Pin.findById(pin._id);

    if (updatedPin.publishingStatus === 'published') {
      res.json({
        success: true,
        message: 'Pin successfully published to Pinterest!',
        pin: updatedPin,
        checklist: updatedPin.publishChecklist,
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Publishing failed: ${updatedPin.lastError || 'Unknown Pinterest API error'}`,
        pin: updatedPin,
        checklist: updatedPin.publishChecklist,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePin = async (req, res) => {
  try {
    const pin = await Pin.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!pin) {
      return res.status(404).json({ success: false, message: 'Pin not found.' });
    }

    await ScheduledJob.deleteOne({ pinId: pin._id });
    await Pin.deleteOne({ _id: pin._id });

    await updateCampaignStats(pin.campaignId);

    res.json({
      success: true,
      message: 'Pin removed successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncPinMetrics = async (req, res) => {
  try {
    const pin = await Pin.findOne({
      _id: req.params.id,
      userId: req.user._id,
      publishingStatus: 'published',
    });

    if (!pin || !pin.pinterestPinId) {
      return res.status(400).json({ success: false, message: 'Pin is not published or missing Pinterest Pin ID.' });
    }

    const analytics = await fetchPinAnalytics({
      userId: req.user._id,
      pinId: pin.pinterestPinId,
    });

    pin.analytics = analytics;
    await pin.save();

    res.json({
      success: true,
      analytics,
      pin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
