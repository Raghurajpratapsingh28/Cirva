// Test script for Dev Score API endpoints
// Run with: node test-devscore-api.js

const BASE_URL = 'http://localhost:3000';

// Test data
const TEST_PUBLIC_KEY = '0x1234567890123456789012345678901234567890';
const TEST_SCORE = 750;

async function testApi() {
  console.log('🧪 Testing Dev Score API endpoints...\n');

  try {
    // Test 1: GET - Fetch dev score (should return 404 for non-existent user)
    console.log('1. Testing GET /api/user/devscore...');
    const getResponse = await fetch(`${BASE_URL}/api/user/devscore?publicKey=${TEST_PUBLIC_KEY}`);
    const getData = await getResponse.json();
    console.log('   Status:', getResponse.status);
    console.log('   Response:', JSON.stringify(getData, null, 2));
    console.log('   Expected: 404 (User not found)\n');

    // Test 2: POST - Update dev score (should return 404 for non-existent user)
    console.log('2. Testing POST /api/user/devscore...');
    const postResponse = await fetch(`${BASE_URL}/api/user/devscore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey: TEST_PUBLIC_KEY,
        devScore: TEST_SCORE,
        source: 'test'
      }),
    });
    const postData = await postResponse.json();
    console.log('   Status:', postResponse.status);
    console.log('   Response:', JSON.stringify(postData, null, 2));
    console.log('   Expected: 404 (User not found)\n');

    // Test 3: PUT - Sync from blockchain (should return 404 for non-existent user)
    console.log('3. Testing PUT /api/user/devscore...');
    const putResponse = await fetch(`${BASE_URL}/api/user/devscore?publicKey=${TEST_PUBLIC_KEY}`, {
      method: 'PUT',
    });
    const putData = await putResponse.json();
    console.log('   Status:', putResponse.status);
    console.log('   Response:', JSON.stringify(putData, null, 2));
    console.log('   Expected: 404 (User not found)\n');

    // Test 4: POST - Invalid data validation
    console.log('4. Testing POST with invalid data...');
    const invalidResponse = await fetch(`${BASE_URL}/api/user/devscore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey: TEST_PUBLIC_KEY,
        devScore: 1500, // Invalid score > 1000
        source: 'test'
      }),
    });
    const invalidData = await invalidResponse.json();
    console.log('   Status:', invalidResponse.status);
    console.log('   Response:', JSON.stringify(invalidData, null, 2));
    console.log('   Expected: 400 (Invalid score)\n');

    // Test 5: GET - Missing publicKey parameter
    console.log('5. Testing GET without publicKey...');
    const missingParamResponse = await fetch(`${BASE_URL}/api/user/devscore`);
    const missingParamData = await missingParamResponse.json();
    console.log('   Status:', missingParamResponse.status);
    console.log('   Response:', JSON.stringify(missingParamData, null, 2));
    console.log('   Expected: 400 (Missing publicKey)\n');

    console.log('✅ All API tests completed!');
    console.log('\n📝 Notes:');
    console.log('- These tests use a dummy public key, so 404 responses are expected');
    console.log('- To test with real data, replace TEST_PUBLIC_KEY with an actual user address');
    console.log('- Make sure the development server is running on localhost:3000');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('- The development server is running (npm run dev)');
    console.log('- The server is accessible at http://localhost:3000');
    console.log('- The database is properly configured');
  }
}

// Run the tests
testApi(); 