import { encrypt, decrypt } from './utils/crypto.js';
import { CREATIVE_CONCEPTS, generateCampaignContent } from './services/aiService.js';
import { analyzeProductUrl } from './services/scraperService.js';

console.log('--- Testing PinPilot AI Services ---');

// 1. Test Crypto (AES-256-GCM)
const sampleToken = 'pina_official_pinterest_access_token_super_secret_12345';
const encrypted = encrypt(sampleToken);
const decrypted = decrypt(encrypted);

console.log('1. Token Encryption Test:');
console.log('   Original:', sampleToken);
console.log('   Encrypted (IV:Tag:Cipher):', encrypted.substring(0, 40) + '...');
console.log('   Decrypted Matches:', decrypted === sampleToken);
if (decrypted !== sampleToken) {
  throw new Error('Encryption/Decryption mismatch!');
}

// 2. Test Creative Concepts
console.log('\n2. Creative Concepts Count:', CREATIVE_CONCEPTS.length);
if (CREATIVE_CONCEPTS.length !== 10) {
  throw new Error('Expected exactly 10 creative concepts!');
}
CREATIVE_CONCEPTS.forEach(c => {
  console.log(`   Concept #${c.index}: ${c.name} (${c.type})`);
});

// 3. Test AI Generation
console.log('\n3. Testing 10 Pin Content & SEO Generation:');
const testProduct = {
  productName: 'SonicPeak Pro Wireless Noise-Cancelling Headphones',
  productDescription: 'Premium over-ear wireless headphones with active noise cancellation and 45-hour battery life.',
  brand: 'SonicPeak',
  category: 'Audio',
  price: '$179.99',
  features: ['Hybrid Active Noise Cancelling', '45-hour battery life', 'Bluetooth 5.3', 'Comfort memory foam'],
  affiliateUrl: 'https://example.com/affiliate-product-link',
};

const pinsContent = await generateCampaignContent(testProduct);
console.log(`   Generated ${pinsContent.length} pins.`);
if (pinsContent.length !== 10) {
  throw new Error('AI service did not generate exactly 10 pins!');
}

pinsContent.forEach((pin, i) => {
  console.log(`\n   --- Pin #${pin.conceptIndex}: ${pin.conceptName} ---`);
  console.log(`   Title (${pin.pinTitle.length} chars): ${pin.pinTitle}`);
  console.log(`   Description (${pin.description.length} chars): ${pin.description.substring(0, 100)}...`);
  console.log(`   CTA: ${pin.callToAction}`);
  console.log(`   Affiliate Disclosure Included: ${pin.description.includes('Affiliate link')}`);
  console.log(`   Keywords: ${pin.keywords.slice(0, 3).join(', ')}`);
});

console.log('\n--- ALL CRITICAL SERVICES PASSED SUCCESSFULLY ---');
process.exit(0);
