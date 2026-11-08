import express from 'express';
import {
  getConnectUrl,
  handleOAuthCallback,
  getAccountStatus,
  getBoards,
  selectDefaultBoard,
  disconnectAccount,
} from '../controllers/pinterestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// OAuth callback does not require JWT authorization header (redirect from Pinterest)
router.get('/callback', handleOAuthCallback);

// Protected routes
router.use(protect);
router.get('/connect', getConnectUrl);
router.get('/status', getAccountStatus);
router.get('/boards', getBoards);
router.post('/default-board', selectDefaultBoard);
router.post('/disconnect', disconnectAccount);

export default router;
