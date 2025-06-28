// Test script to debug OAuth URL generation

// Mock environment variables for testing
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID = '1388487958323138731';

console.log('Environment variables:');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
console.log('NEXT_PUBLIC_DISCORD_CLIENT_ID:', process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID);

async function testOAuthConfig() {
  try {
    // Since we can't directly import TypeScript files in Node.js,
    // let's test the OAuth URL construction manually
    
    // Test Discord OAuth URL construction
    const discordConfig = {
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`,
      scope: 'identify email guilds',
      authUrl: 'https://discord.com/api/oauth2/authorize'
    };
    
    const state = 'test-state-123';
    
    // Manually construct the URL like the OAuth manager does
    const baseUrl = discordConfig.authUrl;
    const params = [
      `client_id=${encodeURIComponent(discordConfig.clientId)}`,
      `redirect_uri=${encodeURIComponent(discordConfig.redirectUri)}`,
      `scope=${encodeURIComponent(discordConfig.scope)}`,
      `state=${encodeURIComponent(state)}`,
      `response_type=code`
    ];
    
    const authUrl = `${baseUrl}?${params.join('&')}`;
    
    console.log('\nGenerated Discord OAuth URL:');
    console.log(authUrl);

    // Parse the URL to check parameters
    const url = new URL(authUrl);
    console.log('\nURL parameters:');
    for (const [key, value] of url.searchParams.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Check if redirect_uri has extra characters
    const redirectUri = url.searchParams.get('redirect_uri');
    console.log('\nRedirect URI analysis:');
    console.log('Raw redirect_uri:', redirectUri);
    console.log('Decoded redirect_uri:', decodeURIComponent(redirectUri));
    console.log('Has extra + characters:', redirectUri.includes('+++'));
    
    // Test other platforms
    console.log('\n--- Testing GitHub OAuth ---');
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = 'test-github-client-id';
    const githubConfig = {
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
      scope: 'read:user user:email',
      authUrl: 'https://github.com/login/oauth/authorize'
    };
    
    const githubParams = [
      `client_id=${encodeURIComponent(githubConfig.clientId)}`,
      `redirect_uri=${encodeURIComponent(githubConfig.redirectUri)}`,
      `scope=${encodeURIComponent(githubConfig.scope)}`,
      `state=${encodeURIComponent(state)}`,
      `response_type=code`
    ];
    
    const githubUrl = `${githubConfig.authUrl}?${githubParams.join('&')}`;
    console.log('GitHub OAuth URL:', githubUrl);
    
    console.log('\n--- Testing Twitter OAuth ---');
    process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID = 'test-twitter-client-id';
    const twitterConfig = {
      clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
      scope: 'tweet.read users.read offline.access',
      authUrl: 'https://twitter.com/i/oauth2/authorize'
    };
    
    const twitterParams = [
      `client_id=${encodeURIComponent(twitterConfig.clientId)}`,
      `redirect_uri=${encodeURIComponent(twitterConfig.redirectUri)}`,
      `scope=${encodeURIComponent(twitterConfig.scope)}`,
      `state=${encodeURIComponent(state)}`,
      `response_type=code`
    ];
    
    const twitterUrl = `${twitterConfig.authUrl}?${twitterParams.join('&')}`;
    console.log('Twitter OAuth URL:', twitterUrl);
    
    // Test validation
    console.log('\n--- Validation Tests ---');
    console.log('Discord redirect URI valid:', !discordConfig.redirectUri.includes('+++'));
    console.log('GitHub redirect URI valid:', !githubConfig.redirectUri.includes('+++'));
    console.log('Twitter redirect URI valid:', !twitterConfig.redirectUri.includes('+++'));
    
  } catch (error) {
    console.error('Error testing OAuth config:', error);
  }
}

testOAuthConfig(); 