import express from 'express';
import {
  getPins,
  getPinById,
  updatePin,
  deletePin,
  regeneratePinImage,
  regeneratePinContent,
  reschedulePin,
  publishPinNow,
  syncPinMetrics,
} from '../controllers/pinController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getPins);
router.get('/:id', getPinById);
router.put('/:id', updatePin);
router.delete('/:id', deletePin);
router.post('/:id/regenerate-image', regeneratePinImage);
router.post('/:id/regenerate-content', regeneratePinContent);
router.post('/:id/reschedule', reschedulePin);
router.post('/:id/publish', publishPinNow);
router.post('/:id/sync-metrics', syncPinMetrics);

export default router;
