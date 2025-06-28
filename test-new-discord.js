// Test script for new Discord credentials
// Replace these with your actual Discord application credentials
const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const redirectUri = 'http://localhost:3000/api/auth/discord/callback';

console.log('Discord OAuth Test Script');
console.log('========================');
console.log('1. Replace the clientId and clientSecret variables above with your new Discord application credentials');
console.log('2. Run this script with: node test-new-discord.js');
console.log('3. If successful, you should see "✅ Client credentials are valid!"');
console.log('');

if (clientId === 'YOUR_NEW_CLIENT_ID_HERE' || clientSecret === 'YOUR_NEW_CLIENT_SECRET_HERE') {
  console.log('❌ Please replace the placeholder credentials with your actual Discord application credentials');
  console.log('   - Go to https://discord.com/developers/applications');
  console.log('   - Create a new application or use an existing one');
  console.log('   - Copy the Client ID and Client Secret from the OAuth2 section');
  process.exit(1);
}

// Test the credentials
async function testCredentials() {
  const fetch = require('node-fetch');
  
  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'identify email guilds'
    });

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      console.log('✅ Client credentials are valid!');
      console.log('✅ You can now use these credentials in your .env file');
    } else {
      console.log('❌ Client credentials are still invalid');
      console.log('   - Double-check your Client ID and Client Secret');
      console.log('   - Make sure your Discord application is properly configured');
    }
  } catch (error) {
    console.error('Error testing credentials:', error.message);
  }
}

testCredentials(); 