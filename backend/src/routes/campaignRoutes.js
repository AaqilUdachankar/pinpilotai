import express from 'express';
import {
  analyzeUrl,
  createCampaign,
  getCampaigns,
  getCampaignById,
  deleteCampaign,
  pauseCampaign,
  resumeCampaign,
} from '../controllers/campaignController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeUrl);
router.post('/', createCampaign);
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.delete('/:id', deleteCampaign);
router.post('/:id/pause', pauseCampaign);
router.post('/:id/resume', resumeCampaign);

export default router;
