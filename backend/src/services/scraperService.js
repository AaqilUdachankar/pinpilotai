import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';

export const analyzeProductUrl = async (url) => {
  logger.info(`Analyzing affiliate URL: ${url}`);
  
  const result = {
    url,
    success: false,
    productName: '',
    brand: '',
    category: 'Product',
    description: '',
    price: '',
    features: [],
    images: [],
    meta: {},
    error: null,
  };

  try {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    ];
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

    const response = await axios.get(url, {
      headers: {
        'User-Agent': randomUA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      timeout: 12000,
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 1. Check for JSON-LD schema.org/Product
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const text = $(elem).html();
        if (!text) return;
        const data = JSON.parse(text);
        
        const findProduct = (item) => {
          if (!item) return null;
          if (Array.isArray(item)) {
            for (const sub of item) {
              const found = findProduct(sub);
              if (found) return found;
            }
          } else if (item['@type'] === 'Product' || (Array.isArray(item['@type']) && item['@type'].includes('Product'))) {
            return item;
          } else if (item['@graph']) {
            return findProduct(item['@graph']);
          }
          return null;
        };

        const product = findProduct(data);
        if (product) {
          if (product.name && !result.productName) result.productName = product.name;
          if (product.description && !result.description) result.description = product.description;
          if (product.brand) {
            result.brand = typeof product.brand === 'string' ? product.brand : product.brand.name || '';
          }
          if (product.category && result.category === 'Product') {
            result.category = product.category;
          }
          if (product.offers) {
            const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
            if (offer && offer.price) {
              const currency = offer.priceCurrency || '$';
              result.price = `${currency} ${offer.price}`.trim();
            }
          }
          if (product.image) {
            const imgs = Array.isArray(product.image) ? product.image : [product.image];
            imgs.forEach((img) => {
              const src = typeof img === 'string' ? img : img.url;
              if (src && !result.images.includes(src)) result.images.push(src);
            });
          }
        }
      } catch (err) {
        // Continue to other tags
      }
    });

    // 2. OpenGraph Meta Tags
    const ogTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content');
    const ogDesc = $('meta[property="og:description"]').attr('content') || $('meta[name="twitter:description"]').attr('content') || $('meta[name="description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
    const ogPrice = $('meta[property="product:price:amount"]').attr('content') || $('meta[property="og:price:amount"]').attr('content');
    const ogCurrency = $('meta[property="product:price:currency"]').attr('content') || $('meta[property="og:price:currency"]').attr('content') || '$';

    if (!result.productName && ogTitle) {
      result.productName = ogTitle.split('|')[0].split(' - ')[0].trim();
    }
    if (!result.description && ogDesc) {
      result.description = ogDesc.trim();
    }
    if (!result.price && ogPrice) {
      result.price = `${ogCurrency} ${ogPrice}`.trim();
    }
    if (ogImage && !result.images.includes(ogImage)) {
      result.images.unshift(ogImage);
    }

    // 3. Fallback standard HTML selectors
    if (!result.productName) {
      const pageTitle = $('#productTitle').text().trim() ||
        $('h1.product-title').text().trim() ||
        $('h1[data-test="product-title"]').text().trim() ||
        $('h1').first().text().trim() ||
        $('title').text().trim();
      
      if (pageTitle) {
        result.productName = pageTitle.split('|')[0].split(' - ')[0].split(' : ')[0].trim();
      }
    }

    // 4. Extract bullet features
    const extractedFeatures = [];
    $('#feature-bullets ul li, #feature-bullets .a-list-item, .product-features li, [data-feature="bullets"] li, ul.features li').each((_, el) => {
      const feat = $(el).text().trim().replace(/\s+/g, ' ');
      if (feat && feat.length > 10 && feat.length < 250 && !feat.toLowerCase().includes('customer reviews')) {
        extractedFeatures.push(feat);
      }
    });

    if (extractedFeatures.length > 0) {
      result.features = extractedFeatures.slice(0, 8);
    }

    // 5. Look for price on page if still empty
    if (!result.price) {
      const priceText = $('.a-price .a-offscreen').first().text().trim() ||
        $('[data-automation="product-price"]').first().text().trim() ||
        $('.product-price, .price, .offer-price, [itemprop="price"]').first().text().trim();
      if (priceText) {
        result.price = priceText;
      }
    }

    // 6. Refine category from breadcrumbs if available
    const breadcrumbs = [];
    $('#wayfinding-breadcrumbs_container a, .breadcrumbs a, nav[aria-label="Breadcrumb"] a').each((_, el) => {
      const crumb = $(el).text().trim();
      if (crumb && crumb.toLowerCase() !== 'home') breadcrumbs.push(crumb);
    });
    if (breadcrumbs.length > 0) {
      result.category = breadcrumbs[breadcrumbs.length - 1];
    }

    // Determine success
    if (result.productName) {
      result.success = true;
    } else {
      result.error = 'Could not automatically identify product name from the provided page.';
    }

    return result;
  } catch (error) {
    logger.warn(`Product URL scraping encounter: ${error.message}`);
    // Return graceful partial data so user can review or manually complete
    return {
      ...result,
      success: false,
      error: `Scraping restricted or failed: ${error.message}. You can enter details manually.`,
    };
  }
};
