const fetch = require('node-fetch');

// Test bot status API endpoint
async function testBotStatus() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Test with a sample public key (you can replace this with a real one)
  const testPublicKey = '0x1234567890123456789012345678901234567890';
  
  console.log('🧪 Testing Bot Status API...');
  console.log(`URL: ${baseUrl}/api/user/bot-status?publicKey=${testPublicKey}`);
  
  try {
    const response = await fetch(`${baseUrl}/api/user/bot-status?publicKey=${testPublicKey}`);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Bot status API is working correctly!');
      if (data.hasBotInvited) {
        console.log(`📊 Bot is invited to ${data.guildCount} server(s)`);
        console.log('🏠 Guilds:', data.guilds.map(g => g.guildId).join(', '));
      } else {
        console.log('❌ Bot is not invited to any servers');
      }
    } else {
      console.log('❌ Bot status API returned an error');
    }
  } catch (error) {
    console.error('❌ Error testing bot status API:', error.message);
  }
}

// Test with missing public key
async function testBotStatusMissingParam() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  console.log('\n🧪 Testing Bot Status API with missing parameter...');
  console.log(`URL: ${baseUrl}/api/user/bot-status`);
  
  try {
    const response = await fetch(`${baseUrl}/api/user/bot-status`);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.status === 400) {
      console.log('✅ API correctly handles missing publicKey parameter');
    } else {
      console.log('❌ API should return 400 for missing parameter');
    }
  } catch (error) {
    console.error('❌ Error testing bot status API:', error.message);
  }
}

async function runTests() {
  await testBotStatus();
  await testBotStatusMissingParam();
}

runTests().catch(console.error); 