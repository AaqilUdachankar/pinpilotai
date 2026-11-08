import axios from 'axios';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// The 10 standard required creative concepts
export const CREATIVE_CONCEPTS = [
  {
    index: 1,
    name: 'Product Showcase',
    type: 'showcase',
    angle: 'Hero product display with sleek lighting and focus on build quality.',
    visualTheme: 'Clean studio lighting, elegant podium, crisp focus, commercial magazine hero look.'
  },
  {
    index: 2,
    name: 'Top Product Features',
    type: 'features',
    angle: 'Key technical highlights and headline features breakdown.',
    visualTheme: 'Modern infographic badge accents, macro detail view, cutting-edge aesthetic.'
  },
  {
    index: 3,
    name: 'Why You Should Buy This Product',
    type: 'value_prop',
    angle: 'Compelling value proposition answering consumer pain points.',
    visualTheme: 'Dynamic angle, problem-solver vibe, vibrant warm lighting, inviting composition.'
  },
  {
    index: 4,
    name: 'Product Benefits & Daily Value',
    type: 'benefits',
    angle: 'How this product improves daily life, saves time, or upgrades comfort.',
    visualTheme: 'Lifestyle backdrop, natural sunny ambient light, relatable premium setting.'
  },
  {
    index: 5,
    name: 'Comparison-Style Creative',
    type: 'comparison',
    angle: 'Why this product outshines standard alternatives on the market.',
    visualTheme: 'Split visual framing or standout spotlight, minimalist modern comparison style.'
  },
  {
    index: 6,
    name: 'Best Features Explained',
    type: 'explainer',
    angle: 'Deep dive into what makes this product uniquely superior and worth having.',
    visualTheme: 'Detailed close-up shot, annotated luxury feel, clean technical precision.'
  },
  {
    index: 7,
    name: 'Minimal Aesthetic Photography',
    type: 'minimalist',
    angle: 'Understated Scandinavian luxury, clean lines, serene backdrop.',
    visualTheme: 'Negative space, muted neutral tones, organic shadows, architectural aesthetic.'
  },
  {
    index: 8,
    name: 'Realistic Lifestyle Environment',
    type: 'lifestyle',
    angle: 'Product seamlessly integrated into an aspirational real-world setting.',
    visualTheme: 'Authentic modern home or professional setup, warm depth-of-field, organic textures.'
  },
  {
    index: 9,
    name: 'Reasons to Consider This Product',
    type: 'reasons',
    angle: 'Curated shortlist of reasons this product belongs on your radar.',
    visualTheme: 'Editor’s pick curation aesthetic, stylish framing, typography-ready clean negative space.'
  },
  {
    index: 10,
    name: 'Ultimate Recommendation Creative',
    type: 'recommendation',
    angle: 'The definitive must-have verdict and review conclusion.',
    visualTheme: 'Bold high-contrast commercial design, award-winning polish, stunning focal presentation.'
  }
];

export const generateCampaignContent = async ({
  userId,
  productName,
  productDescription,
  brand,
  category,
  price,
  features,
  affiliateUrl,
  customInstructions,
  userApiKeys,
  disclosureText,
}) => {
  logger.info(`Generating 10 AI Pin concepts & SEO content for: ${productName}`);

  const apiKey = userApiKeys?.geminiApiKey || process.env.GEMINI_API_KEY;
  const openaiKey = userApiKeys?.openaiApiKey || process.env.OPENAI_API_KEY;

  // Determine disclosure text (empty string when disclosure is optional/disabled)
  const disclosure = (typeof disclosureText === 'string')
    ? disclosureText.trim()
    : (disclosureText === false || disclosureText === null)
      ? ''
      : 'Affiliate link – I may earn a commission from qualifying purchases at no extra cost to you.';

  // Attempt Gemini API if available
  if (apiKey) {
    try {
      const pins = await generateWithGemini({
        apiKey,
        productName,
        productDescription,
        brand,
        category,
        price,
        features,
        customInstructions,
        disclosure,
      });

      if (userId) {
        await recordApiUsage(userId, 'gemini', 1, 1200);
      }
      return pins;
    } catch (err) {
      logger.warn(`Gemini API generation failed: ${err.message}. Trying OpenAI or fallback...`);
    }
  }

  // Attempt OpenAI API if available
  if (openaiKey) {
    try {
      const pins = await generateWithOpenAI({
        apiKey: openaiKey,
        productName,
        productDescription,
        brand,
        category,
        price,
        features,
        customInstructions,
        disclosure,
      });

      if (userId) {
        await recordApiUsage(userId, 'openai', 1, 1400);
      }
      return pins;
    } catch (err) {
      logger.warn(`OpenAI API generation failed: ${err.message}. Using built-in generator...`);
    }
  }

  // If using built-in engine, still record usage in user's free tier counter
  if (userId) {
    await recordApiUsage(userId, 'gemini', 1, 800);
  }

  // Built-in intelligent synthesis generator
  return generateDeterministicContent({
    productName,
    productDescription,
    brand,
    category,
    price,
    features,
    customInstructions,
    disclosure,
  });
};

const recordApiUsage = async (userId, provider, requests = 1, tokens = 1000) => {
  try {
    const incField = provider === 'gemini' ? 'apiUsage.gemini' : 'apiUsage.openai';
    await User.findByIdAndUpdate(userId, {
      $inc: {
        [`${incField}.requestsCount`]: requests,
        [`${incField}.tokensUsed`]: tokens,
      },
      $set: {
        [`${incField}.lastUsedAt`]: new Date(),
      },
    });
  } catch (e) {
    logger.warn(`Could not update API usage for user ${userId}:`, e.message);
  }
};

const generateWithGemini = async ({
  apiKey,
  productName,
  productDescription,
  brand,
  category,
  price,
  features,
  customInstructions,
  disclosure,
}) => {
  const prompt = `You are an expert Pinterest affiliate marketer and SEO copywriter.
Product Details:
- Name: ${productName}
- Brand: ${brand || 'N/A'}
- Category: ${category || 'Products'}
- Price: ${price || 'Check store'}
- Description: ${productDescription || ''}
- Features: ${features?.join(', ') || 'N/A'}
- Custom Instructions: ${customInstructions || 'None'}
${disclosure ? `- Required Affiliate Disclosure: "${disclosure}" (must append at end of each description)` : '- Affiliate Disclosure: None requested. Do NOT append any affiliate disclosure clause.'}

Generate exactly 10 distinct Pinterest Pin assets for this product, matching these 10 creative concepts:
1. Product Showcase
2. Top Product Features
3. Why You Should Buy This Product
4. Product Benefits
5. Comparison-Style Creative
6. Best Features Explained
7. Minimal Aesthetic Product Photography
8. Realistic Lifestyle Environment
9. Reasons to Consider This Product
10. Ultimate Product Recommendation Creative

For EACH of the 10 pins, provide:
- conceptIndex (1 to 10)
- conceptName
- pinTitle (max 90 chars, engaging, SEO-optimized, highly clickable for Pinterest)
- description (200-400 chars, SEO keywords, compelling hook, problem/solution${disclosure ? `, and append this disclosure at the end: "${disclosure}"` : ''})
- caption (short engaging text snippet)
- callToAction (e.g. "Visit Site", "Shop Now", "Check Price")
- keywords (array of 5-8 Pinterest search terms)
- hashtags (array of 4-6 hashtags e.g. #HomeDecor, #TechFinds)
- imagePrompt (detailed, high quality photographic AI prompt for a vertical 1000x1500 commercial Pinterest image)

Return strictly valid JSON in this structure:
{
  "pins": [
    {
      "conceptIndex": 1,
      "conceptName": "Product Showcase",
      "pinTitle": "...",
      "description": "...",
      "caption": "...",
      "callToAction": "Visit Site",
      "keywords": ["..."],
      "hashtags": ["#..."],
      "imagePrompt": "..."
    }
  ]
}`;

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    },
    { timeout: 25000 }
  );

  const rawJson = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(rawJson);
  if (Array.isArray(parsed.pins) && parsed.pins.length >= 10) {
    return parsed.pins.slice(0, 10);
  }
  throw new Error('Gemini response did not contain 10 pins array');
};

const generateWithOpenAI = async ({
  apiKey,
  productName,
  productDescription,
  brand,
  category,
  price,
  features,
  customInstructions,
  disclosure,
}) => {
  const prompt = `You are an expert Pinterest affiliate marketer and SEO copywriter.
Generate 10 distinct Pinterest Pin concepts for:
Product: ${productName}
Brand: ${brand || 'N/A'}
Category: ${category || 'Products'}
Price: ${price || 'Check store'}
Description: ${productDescription || ''}
Features: ${features?.join(', ') || 'N/A'}
${disclosure ? `Required Affiliate Disclosure: "${disclosure}" (must append to description)` : 'Affiliate Disclosure: None requested. Do not append any disclosure clause.'}

Return strictly a JSON object with a "pins" array of 10 items.
Each item must have: conceptIndex (1-10), conceptName, pinTitle, description${disclosure ? ` (including "${disclosure}")` : ''}, caption, callToAction, keywords (array), hashtags (array), imagePrompt (for vertical 2:3 Pinterest commercial photo).`;

  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 25000,
    }
  );

  const parsed = JSON.parse(res.data.choices[0].message.content);
  if (Array.isArray(parsed.pins) && parsed.pins.length >= 10) {
    return parsed.pins.slice(0, 10);
  }
  throw new Error('OpenAI response did not contain 10 pins array');
};

// Deterministic high-quality generator fallback
const generateDeterministicContent = ({
  productName,
  productDescription,
  brand,
  category,
  price,
  features,
  disclosure,
}) => {
  const brandPrefix = brand ? `${brand} ` : '';
  const cleanName = productName.replace(/[^\w\s-]/gi, '').trim();
  const cat = category || 'Lifestyle';

  const baseKeywords = [
    cleanName.toLowerCase(),
    `${cat.toLowerCase()} ideas`,
    'best affiliate finds',
    'must have products',
    'trending on pinterest',
    'top rated',
    'gift guide',
  ];

  const baseHashtags = [
    `#${cat.replace(/\s+/g, '')}`,
    `#PinterestFinds`,
    `#AffiliatePicks`,
    `#TrendingNow`,
    `#MustHave`,
  ];

  return CREATIVE_CONCEPTS.map((concept) => {
    let title = '';
    let description = '';
    let caption = '';
    let callToAction = 'Visit Site';

    const discSuffix = disclosure ? ` ${disclosure.trim()}` : '';

    switch (concept.index) {
      case 1:
        title = `The Ultimate ${brandPrefix}${cleanName} Showcase & Review`;
        description = `Discover why the ${brandPrefix}${cleanName} is catching everyone's attention. Sleek design, reliable performance, and exceptional value in one package. Tap to explore specs and current availability.${discSuffix}`;
        caption = `Take a closer look at the ${cleanName}.`;
        callToAction = 'Visit Site';
        break;
      case 2:
        title = `Top Features of the ${cleanName} You Should Know`;
        description = `From its standout craftsmanship to its intuitive functionality, here are the top features of the ${cleanName}. Everything you need to decide if it's right for you.${discSuffix}`;
        caption = `The standout features that make all the difference.`;
        callToAction = 'Check Features';
        break;
      case 3:
        title = `Why You Should Consider the ${cleanName} Today`;
        description = `Searching for a reliable ${cat}? See the key reasons shoppers love the ${cleanName} and why it could be your best purchase this season.${discSuffix}`;
        caption = `Is the ${cleanName} worth it? Find out here.`;
        callToAction = 'Learn More';
        break;
      case 4:
        title = `How the ${cleanName} Upgrades Your Daily Routine`;
        description = `Experience greater convenience and comfort with the ${cleanName}. Built to elevate your lifestyle with premium quality. Check the latest price and details now.${discSuffix}`;
        caption = `Upgrade your daily life with this simple addition.`;
        callToAction = 'Shop Now';
        break;
      case 5:
        title = `${cleanName}: How It Compares to the Competition`;
        description = `Looking at alternatives for your next ${cat}? Here is our breakdown of how the ${cleanName} outperforms standard options in quality and price.${discSuffix}`;
        caption = `Compare specs and see why it stands out.`;
        callToAction = 'Compare Now';
        break;
      case 6:
        title = `Best Features Explained: ${cleanName} Breakdown`;
        description = `A detailed look at the core specs and capabilities of the ${cleanName}. Discover what sets it apart before you buy. Click to view full details.${discSuffix}`;
        caption = `Deep dive into the specs and real-world performance.`;
        callToAction = 'Read Review';
        break;
      case 7:
        title = `Minimalist & Aesthetic: The ${cleanName} Design`;
        description = `Clean aesthetics meet high utility. The ${cleanName} seamlessly fits any modern aesthetic or curated collection. Click through to view more.${discSuffix}`;
        caption = `Clean, minimal, and beautifully designed.`;
        callToAction = 'View Details';
        break;
      case 8:
        title = `The ${cleanName} in Everyday Life: Real Experience`;
        description = `Wondering how the ${cleanName} looks and feels in everyday use? See authentic impressions and explore the product page for customer feedback.${discSuffix}`;
        caption = `Real world aesthetics and everyday performance.`;
        callToAction = 'Visit Store';
        break;
      case 9:
        title = `Top Reasons the ${cleanName} Is Worth Every Penny`;
        description = `Looking for the best value? Here is our curated list of reasons the ${cleanName} earns a spot on your wishlist. Tap for latest deals and shipping info.${discSuffix}`;
        caption = `Why everyone is talking about this product.`;
        callToAction = 'Check Price';
        break;
      case 10:
      default:
        title = `Our Definitive Recommendation: ${cleanName}`;
        description = `The final verdict is in: the ${cleanName} delivers on its promises. Tap to read the complete breakdown and grab yours directly from the verified vendor.${discSuffix}`;
        caption = `Our top recommended pick for you.`;
        callToAction = 'Get Yours';
        break;
    }

    const imagePrompt = `Vertical 2:3 Pinterest commercial product photo of ${cleanName} by ${brandPrefix || 'brand'}, ${concept.visualTheme}, ${concept.angle}, 1000x1500 pixels, high-end commercial advertising photography, studio lighting, award-winning composition, crisp depth of field, photorealistic.`;

    return {
      conceptIndex: concept.index,
      conceptName: concept.name,
      pinTitle: title.substring(0, 99),
      description: description.substring(0, 799),
      caption,
      callToAction,
      keywords: baseKeywords,
      hashtags: baseHashtags,
      imagePrompt,
    };
  });
};
