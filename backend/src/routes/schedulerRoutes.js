import express from 'express';
import { getSchedulerJobs, pauseScheduler, resumeScheduler, getSchedulerHealth } from '../controllers/schedulerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/jobs', getSchedulerJobs);
router.get('/health', getSchedulerHealth);
router.post('/pause', pauseScheduler);
router.post('/resume', resumeScheduler);

export default router;
