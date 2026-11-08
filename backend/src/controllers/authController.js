import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { logger } from '../utils/logger.js';

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'pinpilot-jwt-super-secret-key-production';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = generateToken(user._id);

    await ActivityLog.create({
      userId: user._id,
      action: 'USER_REGISTERED',
      status: 'success',
      message: `Account created for ${user.email}`,
    });

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('pinterestAccount');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    await ActivityLog.create({
      userId: user._id,
      action: 'USER_LOGGED_IN',
      status: 'info',
      message: `User logged in from ${req.ip || 'unknown IP'}`,
    });

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Google Sign-In & Authentication Controller
 * Supports Google ID tokens, Google OAuth, and profile payload with auto account creation
 */
export const googleLogin = async (req, res) => {
  try {
    const { credential, idToken, googleUser } = req.body;

    let email = '';
    let name = '';
    let googleId = '';
    let picture = '';

    // 1. If Google ID token / credential is provided, verify with Google
    if (credential || idToken) {
      const tokenToVerify = credential || idToken;
      try {
        const googleRes = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`,
          { timeout: 7000 }
        );
        email = googleRes.data.email;
        name = googleRes.data.name || email?.split('@')[0];
        googleId = googleRes.data.sub;
        picture = googleRes.data.picture || '';
      } catch (tokenErr) {
        // Fallback for dev / demo mock tokens
        if (googleUser && googleUser.email) {
          email = googleUser.email;
          name = googleUser.name || email.split('@')[0];
          googleId = googleUser.sub || `google_demo_${Date.now()}`;
          picture = googleUser.picture || '';
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid Google authentication credential. Token could not be verified with Google.',
          });
        }
      }
    } else if (googleUser && googleUser.email) {
      email = googleUser.email;
      name = googleUser.name || email.split('@')[0];
      googleId = googleUser.sub || `google_${Date.now()}`;
      picture = googleUser.picture || '';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Google authentication credential is required.',
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google account does not contain a valid email address.',
      });
    }

    email = email.toLowerCase().trim();

    // 2. Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      if (!user.googleId && googleId) {
        user.googleId = googleId;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    } else {
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        avatar: picture,
        authProvider: 'google',
      });
    }

    const token = generateToken(user._id);

    await ActivityLog.create({
      userId: user._id,
      action: 'GOOGLE_SIGN_IN',
      status: 'success',
      message: `Signed in via Google from ${req.ip || 'client IP'}`,
    });

    res.json({
      success: true,
      message: 'Google Sign-In successful!',
      token,
      user,
    });
  } catch (error) {
    logger.error('Google Sign-In error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Google Sign-In failed.',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('pinterestAccount');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Returns Gemini & OpenAI API Usage & Limit progress data
 */
export const getApiUsage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const usage = user.apiUsage || {
      gemini: { requestsCount: 0, tokensUsed: 0, limitRequests: 1500 },
      openai: { requestsCount: 0, tokensUsed: 0, limitRequests: 1000 },
    };

    const geminiReq = usage.gemini?.requestsCount || 0;
    const geminiLimit = usage.gemini?.limitRequests || 1500;
    const geminiPct = Math.min(Math.round((geminiReq / geminiLimit) * 100), 100);

    const openaiReq = usage.openai?.requestsCount || 0;
    const openaiLimit = usage.openai?.limitRequests || 1000;
    const openaiPct = Math.min(Math.round((openaiReq / openaiLimit) * 100), 100);

    res.json({
      success: true,
      gemini: {
        requestsCount: geminiReq,
        tokensUsed: usage.gemini?.tokensUsed || 0,
        limitRequests: geminiLimit,
        percentage: geminiPct,
        remaining: Math.max(geminiLimit - geminiReq, 0),
        status: geminiPct > 90 ? 'critical' : geminiPct > 70 ? 'warning' : 'healthy',
        hasCustomKey: !!user.apiKeys?.geminiApiKey,
      },
      openai: {
        requestsCount: openaiReq,
        tokensUsed: usage.openai?.tokensUsed || 0,
        limitRequests: openaiLimit,
        percentage: openaiPct,
        remaining: Math.max(openaiLimit - openaiReq, 0),
        status: openaiPct > 90 ? 'critical' : openaiPct > 70 ? 'warning' : 'healthy',
        hasCustomKey: !!user.apiKeys?.openaiApiKey,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { settings, apiKeys } = req.body;
    const user = await User.findById(req.user._id);

    if (settings) {
      user.settings = { ...user.settings, ...settings };
    }

    if (apiKeys) {
      user.apiKeys = {
        ...user.apiKeys,
        ...(apiKeys.geminiApiKey ? { geminiApiKey: apiKeys.geminiApiKey } : {}),
        ...(apiKeys.openaiApiKey ? { openaiApiKey: apiKeys.openaiApiKey } : {}),
        ...(apiKeys.cloudinaryCloudName ? { cloudinaryCloudName: apiKeys.cloudinaryCloudName } : {}),
        ...(apiKeys.cloudinaryApiKey ? { cloudinaryApiKey: apiKeys.cloudinaryApiKey } : {}),
        ...(apiKeys.cloudinaryApiSecret ? { cloudinaryApiSecret: apiKeys.cloudinaryApiSecret } : {}),
        ...(apiKeys.pinterestClientId ? { pinterestClientId: apiKeys.pinterestClientId } : {}),
        ...(apiKeys.pinterestClientSecret ? { pinterestClientSecret: apiKeys.pinterestClientSecret } : {}),
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
