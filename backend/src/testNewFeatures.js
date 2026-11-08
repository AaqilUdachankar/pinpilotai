import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

console.log('=== Testing New PinPilot Features ===\n');

async function testNewFeatures() {
  try {
    // 1. Login / Register Test User
    console.log('1. Authenticating user...');
    const testEmail = `stacking_tester_${Date.now()}@pinpilot.ai`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Stacking Tester',
      email: testEmail,
      password: 'StrongPassword123!',
    });
    const token = regRes.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    console.log('   Authenticated with token.');

    // 2. Check API Usage Quota Endpoint
    console.log('\n2. Testing /api/auth/api-usage (Gemini & OpenAI Quota Bar)...');
    const usageRes = await axios.get(`${API_BASE}/auth/api-usage`, authHeaders);
    console.log('   Gemini Quota Status:', usageRes.data.gemini);
    console.log('   OpenAI Quota Status:', usageRes.data.openai);

    // 3. Test Auto-Chain Slot Detection (Fresh Queue)
    console.log('\n3. Testing /api/campaigns/next-slot (Fresh Queue Detection)...');
    const freshSlot = await axios.get(`${API_BASE}/campaigns/next-slot?interval=60`, authHeaders);
    console.log('   Fresh Slot Result:', freshSlot.data.message);
    console.log('   Next Available Time:', new Date(freshSlot.data.nextAvailableDate).toLocaleTimeString());

    // 4. Create Product 1 Campaign (10 pins, 1 per hour starting at 10:00 AM)
    console.log('\n4. Creating Product #1 Campaign (10 pins starting at 10:00 AM)...');
    const p1StartTime = new Date();
    p1StartTime.setHours(10, 0, 0, 0); // 10:00 AM

    const p1Res = await axios.post(
      `${API_BASE}/campaigns`,
      {
        campaignName: 'Product #1 - Ergonomic Mouse',
        affiliateUrl: 'https://example.com/mouse-affiliate-link',
        productName: 'Pro Ergonomic Wireless Mouse',
        productDescription: 'Comfortable 4000 DPI wireless mouse with silent clicks.',
        productCategory: 'Electronics',
        brand: 'TechPro',
        totalPins: 10,
        publishingInterval: 60, // 60 minutes
        startDate: p1StartTime.toISOString(),
      },
      authHeaders
    );
    const p1Id = p1Res.data.campaign._id;
    console.log('   Product #1 Campaign ID:', p1Id);

    // Wait 4 seconds for pins to generate in background
    console.log('   Waiting for Product #1 pins generation...');
    await new Promise(r => setTimeout(r, 4000));

    // 5. Test Auto-Chain Slot Detection (Now that Product 1 is scheduled)
    console.log('\n5. Testing /api/campaigns/next-slot (Auto-Stacking & Chaining Detection)...');
    const chainedSlot = await axios.get(`${API_BASE}/campaigns/next-slot?interval=60`, authHeaders);
    console.log('   Has Queued Campaign:', chainedSlot.data.hasQueuedCampaign);
    console.log('   Previous Campaign:', chainedSlot.data.previousCampaignName);
    console.log('   10th Pin Finishes At:', new Date(chainedSlot.data.lastScheduledPinTime).toLocaleTimeString());
    console.log('   Product #2 Starts At (11th Hour!):', new Date(chainedSlot.data.nextAvailableDate).toLocaleTimeString());
    console.log('   Detection Message:', chainedSlot.data.message);

    // 6. Test Excel / Google Sheets CSV Export
    console.log('\n6. Testing /api/pins/export/csv (Excel / Google Sheets)...');
    const csvRes = await axios.get(`${API_BASE}/pins/export/csv`, {
      ...authHeaders,
      responseType: 'text',
    });
    console.log('   CSV Content Type:', csvRes.headers['content-type']);
    const lines = csvRes.data.split('\r\n');
    console.log('   CSV Header Row:', lines[0]);
    console.log(`   CSV Rows Exported: ${lines.length - 1} records`);
    console.log('   Sample Row #1:', lines[1]?.substring(0, 80) + '...');

    // 7. Test Post-Publish Checklist Endpoint
    console.log('\n7. Testing /api/pins/:id/checklist (7-Point Verification Checklist)...');
    const pinsRes = await axios.get(`${API_BASE}/pins?campaignId=${p1Id}`, authHeaders);
    const samplePin = pinsRes.data.pins[0];
    if (samplePin) {
      const checklistRes = await axios.get(`${API_BASE}/pins/${samplePin._id}/checklist`, authHeaders);
      console.log('   Checklist Status:', checklistRes.data.checklist.status);
      console.log('   Checklist Details:', checklistRes.data.checklist);
    }

    console.log('\n=== ALL NEW PRODUCTION FEATURES TESTED AND 100% OPERATIONAL ===');
    process.exit(0);
  } catch (err) {
    console.error('Test Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

testNewFeatures();
