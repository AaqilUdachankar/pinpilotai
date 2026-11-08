import axios from 'axios';
import PinterestAccount from '../models/PinterestAccount.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';
const PINTEREST_OAUTH_URL = 'https://www.pinterest.com/oauth';

export const getPinterestCredentials = async (userId) => {
  let clientId = process.env.PINTEREST_CLIENT_ID;
  let clientSecret = process.env.PINTEREST_CLIENT_SECRET;
  let redirectUri = process.env.PINTEREST_REDIRECT_URI || 'http://localhost:5000/api/pinterest/callback';

  if (userId) {
    const user = await User.findById(userId);
    if (user?.apiKeys?.pinterestClientId) {
      clientId = user.apiKeys.pinterestClientId;
    }
    if (user?.apiKeys?.pinterestClientSecret) {
      clientSecret = user.apiKeys.pinterestClientSecret;
    }
  }

  return { clientId, clientSecret, redirectUri };
};

export const getAuthorizationUrl = async (userId, customState = '') => {
  const { clientId, redirectUri } = await getPinterestCredentials(userId);

  if (!clientId) {
    throw new Error('Pinterest App Client ID is not configured. Please configure it in Settings or .env file.');
  }

  const scopes = [
    'boards:read',
    'boards:write',
    'pins:read',
    'pins:write',
    'user_accounts:read',
  ].join(',');

  const state = customState || JSON.stringify({ userId, timestamp: Date.now() });

  const url = `${PINTEREST_OAUTH_URL}/?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;

  return { url, clientId, redirectUri };
};

export const exchangeCodeForToken = async (code, userId) => {
  const { clientId, clientSecret, redirectUri } = await getPinterestCredentials(userId);

  if (!clientId || !clientSecret) {
    throw new Error('Pinterest Client ID or Client Secret missing. Check Settings or .env.');
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);

  try {
    const response = await axios.post(`${PINTEREST_API_BASE}/oauth/token`, params, {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 15000,
    });

    const { access_token, refresh_token, expires_in, scope } = response.data;
    const tokenExpiry = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

    // Fetch user profile from Pinterest
    const profileRes = await axios.get(`${PINTEREST_API_BASE}/user_account`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const pinterestProfile = profileRes.data;

    // Fetch boards
    const boardsRes = await axios.get(`${PINTEREST_API_BASE}/boards`, {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { page_size: 100 },
    });

    const boards = (boardsRes.data?.items || []).map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description || '',
      privacy: b.privacy || 'PUBLIC',
      pinCount: b.pin_count || 0,
      followerCount: b.follower_count || 0,
    }));

    // Save or update PinterestAccount in DB
    let account = await PinterestAccount.findOne({ userId });
    if (!account) {
      account = new PinterestAccount({
        userId,
        pinterestUserId: pinterestProfile.id || pinterestProfile.username || 'unknown',
      });
    }

    account.pinterestUserId = pinterestProfile.id || pinterestProfile.username;
    account.username = pinterestProfile.username || '';
    account.accountType = pinterestProfile.account_type || 'BUSINESS';
    account.profileImage = pinterestProfile.profile_image || '';
    account.websiteUrl = pinterestProfile.website_url || '';
    account.setAccessToken(access_token);
    if (refresh_token) {
      account.setRefreshToken(refresh_token);
    }
    account.tokenExpiry = tokenExpiry;
    account.scopes = scope ? scope.split(',') : [];
    account.connectedBoards = boards;
    account.defaultBoardId = boards.length > 0 ? boards[0].id : null;
    account.isConnected = true;
    account.lastSyncedAt = new Date();

    await account.save();

    // Link to user document
    await User.findByIdAndUpdate(userId, { pinterestAccount: account._id });

    return account;
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    logger.error('Pinterest OAuth Token Exchange Error:', errorDetails);
    throw new Error(`Pinterest authorization failed: ${typeof errorDetails === 'object' ? JSON.stringify(errorDetails) : errorDetails}`);
  }
};

export const getValidAccessToken = async (userId) => {
  const account = await PinterestAccount.findOne({ userId, isConnected: true });
  if (!account) {
    throw new Error('NO_PINTEREST_ACCOUNT_CONNECTED: Please connect your Pinterest Business account before publishing.');
  }

  // Check if token is expired or expiring in 5 minutes
  const isExpired = account.tokenExpiry && (new Date(account.tokenExpiry).getTime() - Date.now() < 300000);
  const refreshToken = account.getRefreshToken();

  if (isExpired && refreshToken) {
    logger.info(`Refreshing Pinterest access token for user ${userId}...`);
    try {
      const { clientId, clientSecret } = await getPinterestCredentials(userId);
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refreshToken);

      const res = await axios.post(`${PINTEREST_API_BASE}/oauth/token`, params, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, expires_in } = res.data;
      account.setAccessToken(access_token);
      if (expires_in) {
        account.tokenExpiry = new Date(Date.now() + expires_in * 1000);
      }
      account.lastSyncedAt = new Date();
      await account.save();

      return access_token;
    } catch (refreshErr) {
      logger.error('Failed to refresh Pinterest token:', refreshErr.response?.data || refreshErr.message);
      // Fallback to existing token
    }
  }

  const token = account.getAccessToken();
  if (!token) {
    throw new Error('Pinterest access token could not be decrypted or is missing.');
  }
  return token;
};

export const fetchPinterestBoards = async (userId) => {
  const token = await getValidAccessToken(userId);
  try {
    const response = await axios.get(`${PINTEREST_API_BASE}/boards`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page_size: 100 },
    });

    const items = response.data?.items || [];
    const boards = items.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description || '',
      privacy: b.privacy || 'PUBLIC',
      pinCount: b.pin_count || 0,
      followerCount: b.follower_count || 0,
    }));

    await PinterestAccount.findOneAndUpdate(
      { userId },
      { connectedBoards: boards, lastSyncedAt: new Date() }
    );

    return boards;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(`Failed to fetch Pinterest boards: ${msg}`);
  }
};

/**
 * Publishes a Pin to Pinterest using the official Pinterest API v5.
 * Strictly sets destination link to the user's affiliate URL!
 */
export const publishPinToPinterest = async ({
  userId,
  boardId,
  title,
  description,
  affiliateUrl,
  imageUrl,
}) => {
  const token = await getValidAccessToken(userId);

  if (!boardId) {
    // If no boardId specified, grab the user's default board
    const account = await PinterestAccount.findOne({ userId });
    boardId = account?.defaultBoardId || account?.connectedBoards?.[0]?.id;
    if (!boardId) {
      throw new Error('NO_BOARD_SELECTED: Please select or create a Pinterest board to publish your pin.');
    }
  }

  // Ensure title and description comply with Pinterest character limits
  const cleanTitle = (title || 'Affiliate Product Pick').substring(0, 100).trim();
  const cleanDescription = (description || '').substring(0, 800).trim();

  // Official Pinterest API v5 Pin Creation Payload
  const payload = {
    board_id: boardId,
    title: cleanTitle,
    description: cleanDescription,
    link: affiliateUrl, // EXACT affiliate link destination
    media_source: {
      source_type: 'image_url',
      url: imageUrl,
    },
  };

  logger.info(`Publishing official Pinterest Pin for user ${userId} to board ${boardId} with affiliate URL: ${affiliateUrl}`);

  try {
    const response = await axios.post(`${PINTEREST_API_BASE}/pins`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    });

    const createdPin = response.data;
    logger.info(`Pinterest Pin successfully published! Pin ID: ${createdPin.id}`);

    return {
      success: true,
      pinterestPinId: createdPin.id,
      boardId: createdPin.board_id,
      url: `https://www.pinterest.com/pin/${createdPin.id}/`,
      data: createdPin,
    };
  } catch (error) {
    const errorData = error.response?.data;
    const statusCode = error.response?.status;
    const errorMsg = errorData?.message || error.message;

    logger.error(`Pinterest API v5 publish error [${statusCode}]:`, errorData || error.message);

    // Provide clear, actionable limitation messages to comply with instruction:
    // "If API access, permissions, or approval are missing, clearly display the limitation instead of pretending a pin was published."
    let detailedReason = errorMsg;
    if (statusCode === 401) {
      detailedReason = 'Pinterest authorization expired or invalid. Please reconnect your account.';
    } else if (statusCode === 403) {
      detailedReason = `Pinterest API permission denied (${errorData?.message || 'Check Pinterest App approval and boards:write permission'}).`;
    } else if (statusCode === 429) {
      detailedReason = 'Pinterest API rate limit exceeded. The scheduler will automatically retry with exponential backoff.';
    } else if (errorData?.code) {
      detailedReason = `Pinterest error [code ${errorData.code}]: ${errorData.message}`;
    }

    const err = new Error(detailedReason);
    err.statusCode = statusCode;
    err.pinterestError = errorData;
    throw err;
  }
};

/**
 * Fetch Pin analytics metrics from Pinterest API v5
 */
export const fetchPinAnalytics = async ({ userId, pinId }) => {
  try {
    const token = await getValidAccessToken(userId);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    const response = await axios.get(`${PINTEREST_API_BASE}/pins/${pinId}/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        start_date: startDate,
        end_date: endDate,
        metric_types: 'IMPRESSION,PIN_CLICK,OUTBOUND_CLICK,SAVE',
      },
      timeout: 10000,
    });

    const metrics = response.data?.all?.summary_metrics || {};
    return {
      available: true,
      impressions: metrics.IMPRESSION || 0,
      pinClicks: metrics.PIN_CLICK || 0,
      outboundClicks: metrics.OUTBOUND_CLICK || 0,
      saves: metrics.SAVE || 0,
      lastFetchedAt: new Date(),
    };
  } catch (error) {
    // If not yet available or trial app limitation, distinguish clearly
    return {
      available: false,
      reason: error.response?.data?.message || 'Metrics currently pending or unavailable for this pin.',
      impressions: 0,
      pinClicks: 0,
      outboundClicks: 0,
      saves: 0,
      lastFetchedAt: new Date(),
    };
  }
};
