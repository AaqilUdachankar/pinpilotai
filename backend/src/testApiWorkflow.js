import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

console.log('=== PinPilot AI End-to-End API Test ===\n');

async function runTests() {
  try {
    // 1. Health Check
    console.log('1. Checking Server Health...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('   Health Status:', health.data.status, `(Uptime: ${Math.round(health.data.uptime)}s)`);

    // 2. Register User
    console.log('\n2. Registering User...');
    const testEmail = `testaffiliate_${Date.now()}@pinpilot.ai`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test Affiliate Marketer',
      email: testEmail,
      password: 'StrongPassword123!',
    });
    const token = regRes.data.token;
    console.log('   User Registered! JWT Token acquired:', token.substring(0, 30) + '...');

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Current User me check
    console.log('\n3. Verifying /api/auth/me...');
    const meRes = await axios.get(`${API_BASE}/auth/me`, authHeaders);
    console.log('   User Profile Verified:', meRes.data.user.email);

    // 4. Analyze Affiliate URL
    console.log('\n4. Testing Product / Affiliate URL Analysis...');
    const analyzeRes = await axios.post(
      `${API_BASE}/campaigns/analyze`,
      { url: 'https://example.com/affiliate-product-link' },
      authHeaders
    );
    console.log('   Analyze Response Status:', analyzeRes.data.success);

    // 5. Create Campaign (Auto-generates 10 pins & schedules)
    console.log('\n5. Creating Affiliate Marketing Campaign (10 Pins)...');
    const campaignRes = await axios.post(
      `${API_BASE}/campaigns`,
      {
        campaignName: 'SonicPeak Wireless Earbuds Launch',
        affiliateUrl: 'https://example.com/affiliate-product-link?ref=pinpilot_test',
        productName: 'SonicPeak Ultra-Lightweight Wireless Earbuds',
        productDescription: 'Studio-grade sound, active noise isolation, IPX7 waterproof, 36hr battery.',
        productCategory: 'Audio & Gadgets',
        brand: 'SonicPeak',
        features: ['Active Noise Isolation', '36hr Battery Playtime', 'IPX7 Waterproof rating', 'Touch Controls'],
        price: '$59.99',
        totalPins: 10,
        publishingInterval: 60, // 1 hour
        startDate: new Date().toISOString(),
      },
      authHeaders
    );

    const campaignId = campaignRes.data.campaign._id;
    console.log('   Campaign created with ID:', campaignId);
    console.log('   Initial Progress:', campaignRes.data.campaign.generationProgress);

    // 6. Wait for background generation pipeline to finish creating 10 pins
    console.log('\n6. Waiting for background pipeline to complete all 10 pins...');
    let ready = false;
    let attempts = 0;
    while (!ready && attempts < 20) {
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
      const campCheck = await axios.get(`${API_BASE}/campaigns/${campaignId}`, authHeaders);
      const camp = campCheck.data.campaign;
      const pins = campCheck.data.pins;
      process.stdout.write(`   [Step: ${camp.generationProgress.step} - ${camp.generationProgress.percentage}% - Pins count: ${pins.length}]\n`);

      if (camp.generationProgress.step === 'ready' || pins.length >= 10) {
        ready = true;
        console.log('\n   🎉 Campaign generation completed successfully!');
        console.log(`   Total Pins Created: ${pins.length}`);

        console.log('\n7. Inspecting Generated Pins & Concept Distribution:');
        pins.forEach(pin => {
          console.log(`   Pin #${pin.conceptIndex} [${pin.creativeConcept.name}]: "${pin.title.substring(0, 45)}..." -> Scheduled: ${new Date(pin.scheduledAt).toLocaleTimeString()}`);
        });

        // 8. Test Scheduler API
        console.log('\n8. Checking Persistent MongoDB Scheduler Jobs...');
        const jobsRes = await axios.get(`${API_BASE}/scheduler/jobs`, authHeaders);
        console.log(`   Scheduler Pending Jobs: ${jobsRes.data.stats.pending}`);

        // 9. Check Analytics Overview
        console.log('\n9. Checking Analytics Overview...');
        const analyticsRes = await axios.get(`${API_BASE}/analytics/overview`, authHeaders);
        console.log('   Analytics Overview Stats:', analyticsRes.data.stats);

        break;
      }
    }

    if (!ready) {
      throw new Error('Pipeline timed out before reaching ready state');
    }

    console.log('\n=== ALL END-TO-END WORKFLOWS PASSED WITH 100% SUCCESS ===');
    process.exit(0);
  } catch (err) {
    console.error('API Test Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
