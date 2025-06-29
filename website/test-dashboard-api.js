// Test script for the new dashboard API
// Run with: node test-dashboard-api.js

const testPublicKey = '0x1234567890123456789012345678901234567890'; // Replace with a real test address

async function testDashboardAPI() {
  console.log('Testing Dashboard API...\n');

  try {
    // Test the dashboard API
    console.log('1. Testing /api/user/dashboard...');
    const dashboardResponse = await fetch(`http://localhost:3000/api/user/dashboard?publicKey=${testPublicKey}`);
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard API Response:');
      console.log('- User:', dashboardData.user ? 'Found' : 'Not found');
      console.log('- Scores:', dashboardData.scores ? 'Available' : 'Not available');
      console.log('- Reputation:', dashboardData.reputation ? 'Available' : 'Not available');
      console.log('- Verified Platforms:', dashboardData.verifiedPlatforms?.length || 0);
      console.log('- Sync Status:', dashboardData.syncStatus?.needsSync ? 'Needs sync' : 'In sync');
    } else {
      const errorData = await dashboardResponse.json();
      console.log('❌ Dashboard API Error:', errorData.error);
    }

    console.log('\n2. Testing /api/user/sync...');
    const syncResponse = await fetch(`http://localhost:3000/api/user/sync?publicKey=${testPublicKey}`, {
      method: 'POST',
    });
    
    if (syncResponse.ok) {
      const syncData = await syncResponse.json();
      console.log('✅ Sync API Response:');
      console.log('- Success:', syncData.success);
      console.log('- Message:', syncData.message);
      console.log('- Sync Results:', Object.keys(syncData.syncResults || {}));
    } else {
      const errorData = await syncResponse.json();
      console.log('❌ Sync API Error:', errorData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDashboardAPI(); 