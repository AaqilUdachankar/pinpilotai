import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger.js';

export const configureCloudinary = (userApiKeys = null) => {
  const cloudName = userApiKeys?.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = userApiKeys?.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY;
  const apiSecret = userApiKeys?.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }
  return false;
};

// Initialize with default env variables
configureCloudinary();

export default cloudinary;
