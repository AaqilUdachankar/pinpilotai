import axios from 'axios';
import { uploadImageToCloudinary } from './cloudinaryService.js';
import { logger } from '../utils/logger.js';

export const generateSinglePinImage = async ({
  productName,
  brand,
  category,
  concept,
  customPrompt,
  userApiKeys,
  referenceImage = null,
}) => {
  const seed = Math.floor(Math.random() * 9999999);
  const cleanProduct = productName.replace(/[^\w\s-]/gi, '').trim();

  // Distinct visual direction per concept
  const visualDirectives = {
    1: 'commercial hero shot, studio white and neutral marble podium, high-end editorial lighting, ultra crisp focus, 8k resolution, product photography',
    2: 'modern product presentation with clean technical highlights, sleek dark-slate studio backdrop, crisp reflections, premium packaging aesthetics',
    3: 'inviting warm ambient light, Scandinavian wooden tabletop, morning sunlight rays, relatable lifestyle framing, commercial advertisement',
    4: 'aspirational luxury interior setting, soft depth of field, warm cozy illumination, lifestyle magazine editorial, sharp product details',
    5: 'bold modern contrast, minimalist architectural setting, striking geometric composition, award-winning advertising visual',
    6: 'macro detail close-up, premium texture and craftsmanship, subtle bokeh background, cinematic lighting, 8k product render',
    7: 'minimalist zen aesthetic, neutral beige and off-white tones, organic linen textures, elegant shadows, Vogue commercial style',
    8: 'contemporary home office or living room environment, authentic real-world perspective, soft daylight, high-end consumer aesthetic',
    9: 'curated editor showcase, stylish pastel backdrop, floating composition, vibrant tasteful accents, commercial brand lookbook',
    10: 'dramatic spotlight, deep rich tones, golden hour side glow, premium packaging elegance, ultimate flagship review feature visual',
  };

  const directive = visualDirectives[concept.conceptIndex] || visualDirectives[1];
  const prompt = customPrompt || `${cleanProduct} by ${brand || 'brand'}, ${concept.conceptName}, ${directive}, 1000x1500 vertical 2:3 aspect ratio, Pinterest commercial product photograph, photorealistic, high resolution, no watermarks`;

  let rawImageUrl = null;

  // 1. If OpenAI DALL-E 3 key is available and configured
  if (userApiKeys?.openaiApiKey || process.env.OPENAI_API_KEY) {
    try {
      const apiKey = userApiKeys?.openaiApiKey || process.env.OPENAI_API_KEY;
      const res = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: prompt.substring(0, 1000),
          n: 1,
          size: '1024x1792', // vertical
          quality: 'standard',
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        }
      );
      if (res.data?.data?.[0]?.url) {
        rawImageUrl = res.data.data[0].url;
      }
    } catch (dalleErr) {
      logger.warn(`DALL-E generation failed: ${dalleErr.message}. Falling back to high-res commercial engine...`);
    }
  }

  // 2. High-speed, high-resolution Flux/Turbo commercial generator (1000x1500 vertical)
  if (!rawImageUrl) {
    const encodedPrompt = encodeURIComponent(prompt.trim());
    rawImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1000&height=1500&nologo=true&seed=${seed}&model=flux`;
  }

  // 3. Upload to Cloudinary for permanent storage
  const uploadResult = await uploadImageToCloudinary(rawImageUrl, 'pinpilot/pins', userApiKeys);

  return {
    imageUrl: uploadResult.url,
    cloudinaryPublicId: uploadResult.publicId,
    isCloudinary: uploadResult.isCloudinary,
    promptUsed: prompt,
    conceptIndex: concept.conceptIndex,
  };
};

export const generateAllPinImages = async ({
  productName,
  brand,
  category,
  pinsData,
  userApiKeys,
  referenceImages = [],
  onProgress = null,
}) => {
  logger.info(`Generating ${pinsData.length} distinct Pinterest images...`);
  const results = [];

  for (let i = 0; i < pinsData.length; i++) {
    const pin = pinsData[i];
    if (onProgress) {
      onProgress(i + 1, pinsData.length, `Generating Pinterest image ${i + 1} of ${pinsData.length}: ${pin.conceptName}`);
    }

    try {
      const imageResult = await generateSinglePinImage({
        productName,
        brand,
        category,
        concept: { conceptIndex: pin.conceptIndex, conceptName: pin.conceptName },
        customPrompt: pin.imagePrompt,
        userApiKeys,
        referenceImage: referenceImages[i % referenceImages.length] || null,
      });

      results.push({
        ...pin,
        imageUrl: imageResult.imageUrl,
        cloudinaryPublicId: imageResult.cloudinaryPublicId,
        isCloudinary: imageResult.isCloudinary,
      });
    } catch (err) {
      logger.error(`Error generating image for pin ${i + 1}:`, err.message);
      // Fallback placeholder image in 1000x1500 format with aesthetic gradient
      const fallbackUrl = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&h=1500&fit=crop&q=80`;
      results.push({
        ...pin,
        imageUrl: fallbackUrl,
        cloudinaryPublicId: null,
        isCloudinary: false,
      });
    }
  }

  return results;
};
