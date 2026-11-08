import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

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
