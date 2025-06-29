// Test script for Social Score Backend Integration
// This script tests the social score API endpoints

const BASE_URL = 'http://localhost:3000';

async function testSocialScoreAPI() {
  console.log('🧪 Testing Social Score Backend Integration...\n');

  const testPublicKey = '0x1234567890123456789012345678901234567890';

  try {
    // Test 1: GET /api/user/socialscore
    console.log('📊 Testing GET /api/user/socialscore...');
    try {
      const response = await fetch(`${BASE_URL}/api/user/socialscore?publicKey=${testPublicKey}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('   ✅ GET /api/user/socialscore successful');
        console.log('   📋 Response:', JSON.stringify(data, null, 2));
      } else {
        console.log(`   ❌ GET /api/user/socialscore failed: ${data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ GET /api/user/socialscore error: ${error.message}`);
    }

    // Test 2: POST /api/user/socialscore (update score)
    console.log('\n📝 Testing POST /api/user/socialscore...');
    try {
      const response = await fetch(`${BASE_URL}/api/user/socialscore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: testPublicKey,
          socialScore: 750,
          source: 'test'
        }),
      });
      const data = await response.json();
      
      if (response.ok) {
        console.log('   ✅ POST /api/user/socialscore successful');
        console.log('   📋 Response:', JSON.stringify(data, null, 2));
      } else {
        console.log(`   ❌ POST /api/user/socialscore failed: ${data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ POST /api/user/socialscore error: ${error.message}`);
    }

    // Test 3: PUT /api/user/socialscore (sync from blockchain)
    console.log('\n🔄 Testing PUT /api/user/socialscore...');
    try {
      const response = await fetch(`${BASE_URL}/api/user/socialscore?publicKey=${testPublicKey}`, {
        method: 'PUT',
      });
      const data = await response.json();
      
      if (response.ok) {
        console.log('   ✅ PUT /api/user/socialscore successful');
        console.log('   📋 Response:', JSON.stringify(data, null, 2));
      } else {
        console.log(`   ❌ PUT /api/user/socialscore failed: ${data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ PUT /api/user/socialscore error: ${error.message}`);
    }

    // Test 4: GET /api/user/profile (check if socialScore is included)
    console.log('\n👤 Testing GET /api/user/profile...');
    try {
      const response = await fetch(`${BASE_URL}/api/user/profile?publicKey=${testPublicKey}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('   ✅ GET /api/user/profile successful');
        console.log('   📋 Response:', JSON.stringify(data, null, 2));
        
        if (data.socialScore !== undefined) {
          console.log('   ✅ socialScore field is included in profile response');
        } else {
          console.log('   ❌ socialScore field is missing from profile response');
        }
      } else {
        console.log(`   ❌ GET /api/user/profile failed: ${data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ GET /api/user/profile error: ${error.message}`);
    }

    console.log('\n✅ Social Score Backend Integration Test Complete!');
    console.log('\n📝 Notes:');
    console.log('   • Some tests may fail if the user does not exist in the database');
    console.log('   • The sync test will fail if the user does not have a verified Twitter account');
    console.log('   • These are expected behaviors for test data');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSocialScoreAPI(); 