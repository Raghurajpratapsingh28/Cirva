const fetch = require('node-fetch');

// Test Discord OAuth credentials
async function testDiscordOAuth() {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = 'http://localhost:3000/api/auth/discord/callback';



  // Test 1: Check if we can make a request to Discord's token endpoint
  try {
    const testBody = new URLSearchParams({
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
      body: testBody.toString(),
    });

    const responseText = await response.text();

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
    const appResponse = await fetch(`https://discord.com/api/v10/applications/${clientId}`, {
      headers: {
        'Authorization': `Bot ${clientSecret}`,
      },
    });

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
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('identify email guilds')}&response_type=code`;
  console.log(authUrl);
  return authUrl;
}

testDiscordOAuth().catch(console.error); 