import express from 'express';
import { getOverviewStats, getCampaignAnalytics, getTopPerformingPins } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getOverviewStats);
router.get('/campaigns/:campaignId', getCampaignAnalytics);
router.get('/top-pins', getTopPerformingPins);

export default router;
