import express from 'express';
import { register, login, getMe, updateSettings, getApiUsage } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/api-usage', protect, getApiUsage);
router.put('/settings', protect, updateSettings);

export default router;
