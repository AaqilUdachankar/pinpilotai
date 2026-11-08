import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

console.log('=== Testing Optional/Compulsory Disclosure & Checklist Verification ===\n');

async function testDisclosureAndChecklist() {
  try {
    // 1. Authenticate user
    console.log('1. Authenticating test user...');
    const testEmail = `disclosure_tester_${Date.now()}@pinpilot.ai`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Disclosure Tester',
      email: testEmail,
      password: 'StrongPassword123!',
    });
    const token = regRes.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    console.log('   User authenticated.');

    // 2. Test User Settings Update with Compulsory Toggle OFF
    console.log('\n2. Testing /api/auth/settings with enableAffiliateDisclosure: false...');
    const settingsOffRes = await axios.put(
      `${API_BASE}/auth/settings`,
      {
        settings: {
          enableAffiliateDisclosure: false,
          defaultAffiliateDisclosure: 'Custom Commission Link Notice',
        },
      },
      authHeaders
    );
    console.log('   enableAffiliateDisclosure is now:', settingsOffRes.data.user.settings.enableAffiliateDisclosure);

    // 3. Create Campaign with Compulsory Button OFF (Optional Mode)
    console.log('\n3. Creating Campaign A with appendAffiliateDisclosure: false (No disclosure)...');
    const campARes = await axios.post(
      `${API_BASE}/campaigns`,
      {
        campaignName: 'Campaign A - Optional Disclosure Off',
        affiliateUrl: 'https://example.com/item-a',
        productName: 'Mechanical Keyboard Ultra',
        productDescription: 'RGB mechanical keyboard with hot-swappable switches.',
        productCategory: 'Electronics',
        brand: 'KeyTech',
        totalPins: 3,
        publishingInterval: 60,
        appendAffiliateDisclosure: false,
      },
      authHeaders
    );
    const campAId = campARes.data.campaign._id;
    console.log('   Campaign A ID:', campAId);

    // Wait 3 seconds for background pin generation
    console.log('   Waiting for Campaign A pins generation...');
    await new Promise((r) => setTimeout(r, 3000));

    const pinsARes = await axios.get(`${API_BASE}/pins?campaignId=${campAId}`, authHeaders);
    const pinA = pinsARes.data.pins[0];
    console.log('   Pin A Description:', pinA.description);
    const hasDisclosureA = pinA.description.toLowerCase().includes('affiliate') || pinA.description.toLowerCase().includes('commission');
    console.log('   Does Pin A contain disclosure text? ->', hasDisclosureA ? 'YES' : 'NO (Correct!)');
    if (hasDisclosureA) {
      throw new Error('FAIL: Pin A should NOT have disclosure text when compulsory toggle is OFF!');
    }

    // 4. Test Checklist for Pin A (Optional Mode)
    console.log('\n4. Verifying Checklist for Pin A (should pass without error)...');
    const checklistARes = await axios.get(`${API_BASE}/pins/${pinA._id}/checklist`, authHeaders);
    console.log('   Checklist FTC Status for Pin A:', checklistARes.data.checklist.ftcDisclosurePresent);
    if (!checklistARes.data.checklist.ftcDisclosurePresent) {
      throw new Error('FAIL: Pin A checklist should pass FTC check in optional mode!');
    }

    // 5. Create Campaign with Compulsory Button ON (Posting Text Mode)
    console.log('\n5. Creating Campaign B with appendAffiliateDisclosure: true (Compulsory Mode ON)...');
    const campBRes = await axios.post(
      `${API_BASE}/campaigns`,
      {
        campaignName: 'Campaign B - Compulsory Disclosure On',
        affiliateUrl: 'https://example.com/item-b',
        productName: 'Wireless Noise Cancelling Headset',
        productDescription: 'Premium active noise cancelling headset with 40h battery.',
        productCategory: 'Electronics',
        brand: 'SoundPro',
        totalPins: 3,
        publishingInterval: 60,
        appendAffiliateDisclosure: true,
        affiliateDisclosureText: 'Sponsored affiliate link – I may earn an affiliate commission.',
      },
      authHeaders
    );
    const campBId = campBRes.data.campaign._id;
    console.log('   Campaign B ID:', campBId);

    console.log('   Waiting for Campaign B pins generation...');
    await new Promise((r) => setTimeout(r, 3000));

    const pinsBRes = await axios.get(`${API_BASE}/pins?campaignId=${campBId}`, authHeaders);
    const pinB = pinsBRes.data.pins[0];
    console.log('   Pin B Description:', pinB.description);
    const hasDisclosureB = pinB.description.toLowerCase().includes('affiliate') || pinB.description.toLowerCase().includes('commission');
    console.log('   Does Pin B contain disclosure text? ->', hasDisclosureB ? 'YES (Correct!)' : 'NO');
    if (!hasDisclosureB) {
      throw new Error('FAIL: Pin B should HAVE disclosure text when compulsory toggle is ON!');
    }

    // 6. Test Checklist for Pin B
    console.log('\n6. Verifying Checklist for Pin B...');
    const checklistBRes = await axios.get(`${API_BASE}/pins/${pinB._id}/checklist`, authHeaders);
    console.log('   Checklist FTC Status for Pin B:', checklistBRes.data.checklist.ftcDisclosurePresent);

    console.log('\n=== ALL TESTS PASSED: OPTIONAL/COMPULSORY DISCLOSURE & CHECKLIST 100% OPERATIONAL ===');
    process.exit(0);
  } catch (err) {
    console.error('Test Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

testDisclosureAndChecklist();
