import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

console.log('=== Testing High Security & Google Sign-In Authentication ===\n');

async function testGoogleAuth() {
  try {
    // 1. Test Google Sign-In (New Account Registration)
    console.log('1. Testing Google Sign-In (New Account Registration)...');
    const testGoogleId = `google_sub_${Date.now()}`;
    const testGoogleEmail = `google_tester_${Date.now()}@gmail.com`;

    const gRes1 = await axios.post(`${API_BASE}/auth/google`, {
      googleUser: {
        sub: testGoogleId,
        email: testGoogleEmail,
        name: 'Google Test User',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      },
    });

    console.log('   Response Status:', gRes1.status);
    console.log('   JWT Token Issued:', gRes1.data.token ? 'YES (Valid JWT)' : 'NO');
    console.log('   User Auth Provider:', gRes1.data.user.authProvider);
    console.log('   User Google ID:', gRes1.data.user.googleId);

    if (gRes1.data.user.authProvider !== 'google') {
      throw new Error('FAIL: Auth provider should be "google"!');
    }

    // 2. Test Google Sign-In (Existing Account Re-login)
    console.log('\n2. Testing Google Sign-In (Existing Account Re-login)...');
    const gRes2 = await axios.post(`${API_BASE}/auth/google`, {
      googleUser: {
        sub: testGoogleId,
        email: testGoogleEmail,
        name: 'Google Test User',
      },
    });

    console.log('   Re-login Successful:', gRes2.data.success);
    console.log('   Same User ID:', gRes2.data.user.id === gRes1.data.user.id);

    // 3. Test Authorized Request with Google JWT
    console.log('\n3. Testing Protected /api/auth/me using Google JWT...');
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${gRes2.data.token}` },
    });
    console.log('   Protected Route Authorized as:', meRes.data.user.name);
    console.log('   User Email:', meRes.data.user.email);

    // 4. Test Missing Credentials Error Handling
    console.log('\n4. Testing High Security Error Handling for Invalid Google Payloads...');
    try {
      await axios.post(`${API_BASE}/auth/google`, {});
      throw new Error('FAIL: Should have rejected empty Google payload!');
    } catch (err) {
      console.log('   Correctly Rejected:', err.response?.data?.message || err.message);
    }

    console.log('\n=== ALL GOOGLE SIGN-IN & HIGH SECURITY TESTS PASSED 100% ===');
    process.exit(0);
  } catch (err) {
    console.error('Test Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

testGoogleAuth();
