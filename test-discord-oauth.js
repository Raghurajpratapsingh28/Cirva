const fetch = require('node-fetch');

// Test Discord OAuth credentials
async function testDiscordOAuth() {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = 'http://localhost:3000/api/auth/discord/callback';

  console.log('Testing Discord OAuth Configuration:');
  console.log('Client ID:', clientId);
  console.log('Client Secret (first 10 chars):', clientSecret.substring(0, 10) + '...');
  console.log('Redirect URI:', redirectUri);

  // Test 1: Check if we can make a request to Discord's token endpoint
  try {
    const testBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'identify email guilds'
    });

    console.log('\nTest 1: Testing client credentials flow...');
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: testBody.toString(),
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      console.log('✅ Client credentials are valid!');
    } else {
      console.log('❌ Client credentials are invalid');
    }
  } catch (error) {
    console.error('Error testing client credentials:', error.message);
  }

  // Test 2: Check Discord application info
  try {
    console.log('\nTest 2: Testing Discord application info...');
    const appResponse = await fetch(`https://discord.com/api/v10/applications/${clientId}`, {
      headers: {
        'Authorization': `Bot ${clientSecret}`,
      },
    });

    console.log('App info response status:', appResponse.status);
    if (appResponse.ok) {
      const appData = await appResponse.json();
      console.log('✅ Application found:', appData.name);
    } else {
      console.log('❌ Could not fetch application info');
    }
  } catch (error) {
    console.error('Error testing application info:', error.message);
  }

  // Test 3: Generate authorization URL
  console.log('\nTest 3: Authorization URL:');
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('identify email guilds')}&response_type=code`;
  console.log(authUrl);
}

testDiscordOAuth().catch(console.error); 