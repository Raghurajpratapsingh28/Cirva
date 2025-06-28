# Discord OAuth Setup Guide

This guide explains how to set up Discord OAuth 2.0 for the Web3 Identity project.

## Prerequisites

1. A Discord Developer Account
2. A Discord Application created in the Discord Developer Portal
3. Environment variables configured

## Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to "OAuth2" in the left sidebar
4. Copy the **Client ID** and **Client Secret**
5. Add redirect URLs:
   - `http://localhost:3000/api/auth/discord/callback` (for development)
   - `https://yourdomain.com/api/auth/discord/callback` (for production)

## Step 2: Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Discord OAuth
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# Other OAuth platforms
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
NEXT_PUBLIC_TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

## Step 3: Get Your Discord Credentials

1. In your Discord Application settings, copy the **Client ID** and **Client Secret**
2. Replace `your_discord_client_id_here` and `your_discord_client_secret_here` in your `.env.local` file

## Step 4: Test the Implementation

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/verify`
3. Connect your wallet
4. Click "Connect Discord" to test the OAuth flow

## How It Works

The Discord OAuth implementation uses OAuth 2.0 for secure authentication:

1. **Authorization Request**: The app generates a state parameter for security
2. **User Authorization**: User is redirected to Discord to authorize the app
3. **Callback**: Discord redirects back with an authorization code
4. **Token Exchange**: The app exchanges the code for an access token
5. **User Data**: The app fetches user profile and guild data using the access token
6. **Verification**: User data is stored and the account is marked as verified

## Scopes Used

The Discord OAuth implementation requests the following scopes:

- `identify` - Access to user's basic information
- `email` - Access to user's email address
- `guilds` - Access to user's guild (server) memberships

## Files Modified

- `lib/api/discord.ts` - Discord API integration
- `lib/auth/oauth.ts` - OAuth manager configuration
- `lib/auth/platforms.ts` - Platform authentication logic
- `app/api/auth/discord/callback/route.ts` - OAuth callback handler
- `components/OAuthVerificationButton.tsx` - OAuth button component

## Security Features

- **State Parameter**: Prevents CSRF attacks
- **Secure Storage**: OAuth state is stored securely
- **No Credential Storage**: User credentials are never stored on the server
- **Token-based Authentication**: Uses Discord's OAuth 2.0 tokens

## Data Collected

The Discord OAuth flow collects the following user data:

- **Basic Profile**: Username, display name, avatar, email
- **Account Status**: Verification status, premium type, MFA status
- **Guild Memberships**: List of servers the user is a member of
- **Account Age**: Estimated from Discord ID (snowflake)

## Reputation Score Calculation

The Discord reputation score is calculated based on:

- **Verified Account**: +100 points
- **Guild Participation**: +10 points per guild (max 200)
- **Premium Subscription**: +50 points
- **MFA Enabled**: +25 points
- **Account Age**: +30 points per year (max 150)

**Maximum Score**: 500 points

## Troubleshooting

### Common Issues

1. **"Discord OAuth not configured"**: Check that your environment variables are set correctly
2. **"Invalid redirect URI"**: Ensure the redirect URL in Discord App settings matches your environment
3. **"Token exchange failed"**: Verify your Client ID and Secret are correct
4. **"Missing parameters"**: Check that the OAuth flow is completing properly
5. **"Insufficient permissions"**: Ensure the required scopes are configured

### Debug Mode

Enable debug logging by checking the browser console and server logs for detailed error messages.

## Production Deployment

For production deployment:

1. Update the redirect URL in Discord Application settings to your production domain
2. Set `NEXT_PUBLIC_APP_URL` to your production URL
3. Use a proper database for OAuth state storage (currently using in-memory storage)
4. Consider using Redis for better OAuth state management
5. Implement proper session management for production use

## API Endpoints

- `GET /api/auth/discord/callback` - OAuth callback handler
- `GET /api/user/profile` - User profile data (includes Discord verification status)

## Database Schema

The Discord verification data is stored in the `User` table:

```sql
discordUsername   String?
isVerifiedDiscord Boolean  @default(false)
```

## Discord API Rate Limits

Be aware of Discord's API rate limits:

- **User Endpoint**: 5 requests per 5 seconds
- **Guilds Endpoint**: 5 requests per 5 seconds
- **Guild Members Endpoint**: 10 requests per 10 seconds

The implementation includes proper error handling for rate limit responses.

## Additional Features

### Guild Verification

You can extend the Discord integration to verify users in specific guilds:

```typescript
// Check if user is in a specific guild
const isInGuild = await discordAPI.isUserInGuild(guildId, accessToken);
```

### Guild Member Details

Get detailed information about a user's membership in a specific guild:

```typescript
// Get guild member details
const member = await discordAPI.getGuildMember(guildId, userId, accessToken);
```

## Best Practices

1. **Always validate the state parameter** to prevent CSRF attacks
2. **Store tokens securely** and never expose them in client-side code
3. **Handle rate limits gracefully** with proper error handling
4. **Respect user privacy** by only requesting necessary scopes
5. **Implement proper error handling** for all API calls
6. **Use HTTPS in production** for secure OAuth communication 