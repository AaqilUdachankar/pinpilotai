import Campaign from '../models/Campaign.js';
import Pin from '../models/Pin.js';
import ScheduledJob from '../models/ScheduledJob.js';
import ActivityLog from '../models/ActivityLog.js';
import { analyzeProductUrl } from '../services/scraperService.js';
import { generateCampaignContent } from '../services/aiService.js';
import { generateAllPinImages } from '../services/imageService.js';
import { schedulePin, pauseCampaignJobs, resumeCampaignJobs } from '../services/schedulerService.js';
import PinterestAccount from '../models/PinterestAccount.js';
import { logger } from '../utils/logger.js';

/**
 * Step 1: Analyze Affiliate URL
 */
export const analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'Please provide a valid affiliate product URL.' });
    }

    const scraped = await analyzeProductUrl(url);

    res.json({
      success: true,
      data: scraped,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Automatic detection of next available campaign timing (Smart Stacking / Auto-Chaining)
 * Detects when the latest scheduled pin finishes, and calculates the exact 11th hour start time!
 */
export const getNextAvailableSlot = async (req, res) => {
  try {
    const userId = req.user._id;
    const intervalMinutes = Number(req.query.interval) || 60;

    // Find the latest scheduled pin for this user
    const latestPin = await Pin.findOne({
      userId,
      publishingStatus: 'scheduled',
    })
      .sort({ scheduledAt: -1 })
      .populate('campaignId', 'campaignName productName');

    const now = new Date();

    if (latestPin && new Date(latestPin.scheduledAt) > now) {
      const lastTime = new Date(latestPin.scheduledAt);
      const nextTime = new Date(lastTime.getTime() + intervalMinutes * 60 * 1000);

      return res.json({
        success: true,
        hasQueuedCampaign: true,
        lastScheduledPinTime: lastTime,
        nextAvailableDate: nextTime,
        previousCampaignName: latestPin.campaignId?.campaignName || 'Previous Campaign',
        previousProductName: latestPin.campaignId?.productName || 'Previous Product',
        message: `Auto-detected active queue. Previous campaign finishes at ${lastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Next campaign will start at ${nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      });
    }

    // If no pins in queue, start at the next round hour
    const nextRoundHour = new Date(now);
    nextRoundHour.setMinutes(0, 0, 0);
    nextRoundHour.setHours(nextRoundHour.getHours() + 1);

    res.json({
      success: true,
      hasQueuedCampaign: false,
      lastScheduledPinTime: null,
      nextAvailableDate: nextRoundHour,
      previousCampaignName: null,
      message: `Queue is currently open. Ready to start immediately at ${nextRoundHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Step 2: Create Campaign & Execute Full Automation Pipeline
 */
export const createCampaign = async (req, res) => {
  try {
    const userId = req.user._id;
    let {
      campaignName,
      affiliateUrl,
      productName,
      productDescription,
      productCategory,
      brand,
      features,
      price,
      totalPins = 10,
      publishingInterval = 60, // in minutes
      startDate,
      autoChain = false,
      selectedBoard,
      imageStyle = 'commercial-product-aesthetic',
      customInstructions = '',
      referenceImages = [],
      appendAffiliateDisclosure,
      affiliateDisclosureText,
    } = req.body;

    if (!affiliateUrl || !productName) {
      return res.status(400).json({
        success: false,
        message: 'Product name and affiliate URL are required to create a campaign.',
      });
    }

    // Determine affiliate disclosure setting (Optional by default; compulsory when toggled ON)
    const shouldAppendDisclosure = appendAffiliateDisclosure !== undefined
      ? Boolean(appendAffiliateDisclosure)
      : Boolean(req.user.settings?.enableAffiliateDisclosure);

    const activeDisclosureText = shouldAppendDisclosure
      ? (affiliateDisclosureText || req.user.settings?.defaultAffiliateDisclosure || 'Affiliate link – I may earn a commission from qualifying purchases at no extra cost to you.')
      : '';

    // Determine Start Date (Auto-chain detection if requested or selected)
    let calculatedStartDate = startDate ? new Date(startDate) : new Date();

    if (autoChain || !startDate) {
      const latestPin = await Pin.findOne({
        userId,
        publishingStatus: 'scheduled',
      }).sort({ scheduledAt: -1 });

      const now = new Date();
      if (latestPin && new Date(latestPin.scheduledAt) > now) {
        // Auto-stack right after the 10th post of previous product
        calculatedStartDate = new Date(new Date(latestPin.scheduledAt).getTime() + (Number(publishingInterval) || 60) * 60 * 1000);
        logger.info(`Auto-chaining campaign "${campaignName}" to start at ${calculatedStartDate.toISOString()} after pin ${latestPin._id}`);
      }
    }

    // Determine default board if not provided
    let board = selectedBoard;
    if (!board || !board.id) {
      const pinterestAcc = await PinterestAccount.findOne({ userId });
      if (pinterestAcc && pinterestAcc.connectedBoards && pinterestAcc.connectedBoards.length > 0) {
        const defaultB = pinterestAcc.connectedBoards.find((b) => b.id === pinterestAcc.defaultBoardId) || pinterestAcc.connectedBoards[0];
        board = { id: defaultB.id, name: defaultB.name };
      }
    }

    // 1. Create Campaign in DB
    const campaign = await Campaign.create({
      userId,
      campaignName: campaignName || `${productName} Automation Campaign`,
      affiliateUrl,
      productName,
      productDescription: productDescription || '',
      productCategory: productCategory || 'Product',
      brand: brand || '',
      features: Array.isArray(features) ? features : [],
      price: price || '',
      totalPins: Math.min(Math.max(Number(totalPins) || 10, 1), 20),
      publishingInterval: Number(publishingInterval) || 60,
      startDate: calculatedStartDate,
      selectedBoard: board || { id: null, name: null },
      campaignStatus: 'generating',
      imageStyle,
      customInstructions,
      appendAffiliateDisclosure: shouldAppendDisclosure,
      affiliateDisclosureText: activeDisclosureText,
      generationProgress: {
        step: 'analyzing',
        percentage: 15,
        message: 'Analyzing product information and SEO angles...',
      },
    });

    await ActivityLog.create({
      userId,
      campaignId: campaign._id,
      action: 'CAMPAIGN_CREATED',
      status: 'info',
      message: `Campaign "${campaign.campaignName}" created. Scheduled to start: ${calculatedStartDate.toLocaleString()}`,
    });

    // Respond immediately with the created campaign
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully. Generating 10 Pinterest pins in background...',
      campaign,
    });

    // Run the remaining generation pipeline asynchronously on backend
    runCampaignGenerationPipeline({
      campaignId: campaign._id,
      userId,
      campaignData: {
        campaignName: campaign.campaignName,
        affiliateUrl,
        productName,
        productDescription,
        productCategory,
        brand,
        features: campaign.features,
        price,
        totalPins: campaign.totalPins,
        publishingInterval: campaign.publishingInterval,
        startDate: campaign.startDate,
        selectedBoard: campaign.selectedBoard,
        customInstructions,
        referenceImages,
        appendAffiliateDisclosure: shouldAppendDisclosure,
        affiliateDisclosureText: activeDisclosureText,
      },
      user: req.user,
    }).catch(async (pipelineErr) => {
      logger.error(`Campaign generation pipeline failed for ${campaign._id}:`, pipelineErr);
      await Campaign.findByIdAndUpdate(campaign._id, {
        campaignStatus: 'failed',
        'generationProgress.step': 'failed',
        'generationProgress.error': pipelineErr.message,
        'generationProgress.message': `Pipeline error: ${pipelineErr.message}`,
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Background pipeline runner
 */
const runCampaignGenerationPipeline = async ({ campaignId, userId, campaignData, user }) => {
  logger.info(`Starting background generation pipeline for campaign ${campaignId}...`);

  // Step 1: AI Content Generation (10 concepts, titles, descriptions, hashtags)
  await Campaign.findByIdAndUpdate(campaignId, {
    'generationProgress.step': 'generating_content',
    'generationProgress.percentage': 30,
    'generationProgress.message': 'AI generating 10 unique Pinterest concepts, SEO titles, descriptions & hashtags...',
  });

  const pinsContent = await generateCampaignContent({
    userId,
    productName: campaignData.productName,
    productDescription: campaignData.productDescription,
    brand: campaignData.brand,
    category: campaignData.productCategory,
    price: campaignData.price,
    features: campaignData.features,
    affiliateUrl: campaignData.affiliateUrl,
    customInstructions: campaignData.customInstructions,
    userApiKeys: user.apiKeys,
    disclosureText: campaignData.appendAffiliateDisclosure
      ? (campaignData.affiliateDisclosureText || user.settings?.defaultAffiliateDisclosure)
      : '',
  });

  const selectedPinsContent = pinsContent.slice(0, campaignData.totalPins || 10);

  // Step 2: AI Image Generation (10 vertical 1000x1500 commercial designs)
  await Campaign.findByIdAndUpdate(campaignId, {
    'generationProgress.step': 'generating_images',
    'generationProgress.percentage': 50,
    'generationProgress.message': 'AI generating 10 vertical 1000x1500 high-res Pinterest images...',
  });

  const generatedPins = await generateAllPinImages({
    productName: campaignData.productName,
    brand: campaignData.brand,
    category: campaignData.productCategory,
    pinsData: selectedPinsContent,
    userApiKeys: user.apiKeys,
    referenceImages: campaignData.referenceImages,
    onProgress: async (current, total, msg) => {
      const pct = 50 + Math.floor((current / total) * 35);
      await Campaign.findByIdAndUpdate(campaignId, {
        'generationProgress.percentage': pct,
        'generationProgress.message': msg,
      });
    },
  });

  // Step 3: Schedule pins and persist in MongoDB
  await Campaign.findByIdAndUpdate(campaignId, {
    'generationProgress.step': 'scheduling_pins',
    'generationProgress.percentage': 90,
    'generationProgress.message': 'Scheduling pins for automated 24/7 background publishing...',
  });

  const baseStart = new Date(campaignData.startDate || Date.now());
  const intervalMinutes = campaignData.publishingInterval || 60;

  for (let i = 0; i < generatedPins.length; i++) {
    const pinData = generatedPins[i];
    // Exact consecutive time: Pin 0 at start time, Pin 1 at +interval, etc.
    const scheduledTime = new Date(baseStart.getTime() + i * intervalMinutes * 60 * 1000);

    const pin = await Pin.create({
      campaignId,
      userId,
      imageUrl: pinData.imageUrl,
      cloudinaryPublicId: pinData.cloudinaryPublicId || '',
      title: pinData.pinTitle,
      description: pinData.description,
      caption: pinData.caption || '',
      keywords: pinData.keywords || [],
      hashtags: pinData.hashtags || [],
      callToAction: pinData.callToAction || 'Visit Site',
      affiliateUrl: campaignData.affiliateUrl, // original affiliate destination
      creativeConcept: {
        name: pinData.conceptName,
        description: pinData.caption,
      },
      conceptIndex: pinData.conceptIndex || i + 1,
      scheduledAt: scheduledTime,
      publishingStatus: 'scheduled',
      pinterestBoardId: campaignData.selectedBoard?.id || null,
      publishChecklist: {
        affiliateLinkVerified: !!campaignData.affiliateUrl,
        pinterestPinVerified: false,
        boardAttached: !!(campaignData.selectedBoard?.id),
        ftcDisclosurePresent: campaignData.appendAffiliateDisclosure
          ? (pinData.description?.toLowerCase().includes('affiliate') || pinData.description?.toLowerCase().includes('commission'))
          : true,
        creativeDelivered: !!pinData.imageUrl,
        seoTagsIndexed: !!(pinData.pinTitle && pinData.keywords?.length > 0),
        nextInQueueArmed: true,
        verifiedAt: null,
        status: 'pending',
        notes: `Armed for publishing at ${scheduledTime.toLocaleTimeString()}`,
      },
    });

    // Persistent Agenda / MongoDB schedule
    await schedulePin({
      pinId: pin._id,
      campaignId,
      userId,
      publishDate: scheduledTime,
    });
  }

  // Finalize campaign state
  await Campaign.findByIdAndUpdate(campaignId, {
    campaignStatus: 'active',
    'generationProgress.step': 'ready',
    'generationProgress.percentage': 100,
    'generationProgress.message': `Campaign ready! ${generatedPins.length} pins scheduled. Next pin at ${baseStart.toLocaleTimeString()}`,
    'stats.totalPinsCount': generatedPins.length,
    'stats.scheduledCount': generatedPins.length,
    'stats.publishedCount': 0,
    'stats.failedCount': 0,
  });

  await ActivityLog.create({
    userId,
    campaignId,
    action: 'CAMPAIGN_ACTIVATED',
    status: 'success',
    message: `All ${generatedPins.length} pins created and queued. Starting: ${baseStart.toLocaleString()}`,
  });

  logger.info(`Campaign ${campaignId} successfully generated and scheduled!`);
};

export const getCampaigns = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, search, limit = 50, page = 1 } = req.query;

    const query = { userId };
    if (status && status !== 'all') {
      query.campaignStatus = status;
    }
    if (search) {
      query.$or = [
        { campaignName: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
      ];
    }

    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Campaign.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      campaigns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const pins = await Pin.find({ campaignId: campaign._id }).sort({ scheduledAt: 1 });

    res.json({
      success: true,
      campaign,
      pins,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    await Pin.deleteMany({ campaignId: campaign._id });
    await ScheduledJob.deleteMany({ campaignId: campaign._id });
    await Campaign.deleteOne({ _id: campaign._id });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'CAMPAIGN_DELETED',
      status: 'info',
      message: `Campaign "${campaign.campaignName}" deleted.`,
    });

    res.json({
      success: true,
      message: 'Campaign and associated pins deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pauseCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    await pauseCampaignJobs(campaign._id);

    res.json({
      success: true,
      message: 'Campaign and scheduled pins paused.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resumeCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    await resumeCampaignJobs(campaign._id);

    res.json({
      success: true,
      message: 'Campaign resumed. Next pins rescheduled.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
