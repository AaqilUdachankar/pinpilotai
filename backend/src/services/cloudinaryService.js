import { v2 as cloudinary } from 'cloudinary';
import { configureCloudinary } from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

export const uploadImageToCloudinary = async (imageInput, folder = 'pinpilot/pins', userApiKeys = null) => {
  const isConfigured = configureCloudinary(userApiKeys);

  if (!isConfigured) {
    logger.warn('Cloudinary is not fully configured (missing CLOUDINARY_CLOUD_NAME, API_KEY or SECRET). Returning source URL.');
    // If imageInput is already a remote URL (like AI generated CDN or pollination/unsplash), return as is
    return {
      url: imageInput,
      publicId: null,
      isCloudinary: false,
    };
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(imageInput, {
      folder,
      transformation: [
        { width: 1000, height: 1500, crop: 'fill', gravity: 'auto' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      isCloudinary: true,
      width: uploadResult.width,
      height: uploadResult.height,
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error.message);
    // Graceful fallback to input URL
    return {
      url: imageInput,
      publicId: null,
      isCloudinary: false,
      error: error.message,
    };
  }
};
