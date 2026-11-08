import PinterestAccount from '../models/PinterestAccount.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { getAuthorizationUrl, exchangeCodeForToken, fetchPinterestBoards } from '../services/pinterestService.js';
import { logger } from '../utils/logger.js';

export const getConnectUrl = async (req, res) => {
  try {
    const userId = req.user._id;
    const { url, clientId, redirectUri } = await getAuthorizationUrl(userId);

    res.json({
      success: true,
      authUrl: url,
      clientId,
      redirectUri,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const handleOAuthCallback = async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      logger.error('Pinterest OAuth Callback Error:', error, error_description);
      return res.redirect(`/pinterest-accounts?error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code) {
      return res.redirect('/pinterest-accounts?error=missing_code');
    }

    let userId = null;
    if (state) {
      try {
        const parsed = JSON.parse(decodeURIComponent(state));
        userId = parsed.userId;
      } catch (e) {
        // State was not JSON
      }
    }

    // If userId not found in state, try authenticated session if any
    if (!userId && req.user) {
      userId = req.user._id;
    }

    if (!userId) {
      return res.redirect('/pinterest-accounts?error=session_expired_please_reconnect');
    }

    const account = await exchangeCodeForToken(code, userId);

    await ActivityLog.create({
      userId,
      action: 'PINTEREST_CONNECTED',
      status: 'success',
      message: `Pinterest account @${account.username || account.pinterestUserId} successfully connected.`,
    });

    res.redirect('/pinterest-accounts?status=success&username=' + encodeURIComponent(account.username || ''));
  } catch (error) {
    logger.error('Pinterest OAuth callback handling failure:', error.message);
    res.redirect(`/pinterest-accounts?error=${encodeURIComponent(error.message)}`);
  }
};

export const getAccountStatus = async (req, res) => {
  try {
    const account = await PinterestAccount.findOne({ userId: req.user._id });
    if (!account || !account.isConnected) {
      return res.json({
        success: true,
        connected: false,
        account: null,
      });
    }

    res.json({
      success: true,
      connected: true,
      account,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBoards = async (req, res) => {
  try {
    const boards = await fetchPinterestBoards(req.user._id);
    res.json({
      success: true,
      boards,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const selectDefaultBoard = async (req, res) => {
  try {
    const { boardId } = req.body;
    if (!boardId) {
      return res.status(400).json({ success: false, message: 'Board ID is required' });
    }

    const account = await PinterestAccount.findOne({ userId: req.user._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'No Pinterest account connected' });
    }

    account.defaultBoardId = boardId;
    await account.save();

    res.json({
      success: true,
      message: 'Default board updated successfully',
      defaultBoardId: boardId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const disconnectAccount = async (req, res) => {
  try {
    const account = await PinterestAccount.findOne({ userId: req.user._id });
    if (account) {
      account.isConnected = false;
      account.accessTokenEncrypted = '';
      account.refreshTokenEncrypted = null;
      await account.save();
    }

    await User.findByIdAndUpdate(req.user._id, { pinterestAccount: null });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'PINTEREST_DISCONNECTED',
      status: 'warning',
      message: 'Pinterest account disconnected.',
    });

    res.json({
      success: true,
      message: 'Pinterest account disconnected.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
