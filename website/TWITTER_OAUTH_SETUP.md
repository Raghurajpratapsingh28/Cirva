# Twitter OAuth Setup Guide

This guide explains how to set up Twitter OAuth 2.0 with PKCE for the Web3 Identity project.

## Prerequisites

1. A Twitter Developer Account
2. A Twitter App created in the Twitter Developer Portal
3. Environment variables configured

## Step 1: Create a Twitter App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use an existing one
3. Navigate to "App settings" > "User authentication settings"
4. Enable OAuth 2.0
5. Set the following:
   - **App permissions**: Read
   - **Type of App**: Web App
   - **Callback URLs**: `http://localhost:3000/api/auth/twitter/callback` (for development)
   - **Website URL**: `http://localhost:3000` (for development)

## Step 2: Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Twitter OAuth (OAuth 2.0 with PKCE)
NEXT_PUBLIC_TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here

# Other OAuth platforms
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

## Step 3: Get Your Twitter Credentials

1. In your Twitter App settings, copy the **Client ID** and **Client Secret**
2. Replace `your_twitter_client_id_here` and `your_twitter_client_secret_here` in your `.env.local` file

## Step 4: Test the Implementation

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/verify`
3. Connect your wallet
4. Click "Connect Twitter" to test the OAuth flow

## How It Works

The Twitter OAuth implementation uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) for enhanced security:

1. **Authorization Request**: The app generates a code verifier and challenge
2. **User Authorization**: User is redirected to Twitter to authorize the app
3. **Callback**: Twitter redirects back with an authorization code
4. **Token Exchange**: The app exchanges the code for an access token using the code verifier
5. **User Data**: The app fetches user profile data using the access token
6. **Verification**: User data is stored and the account is marked as verified

## Files Modified

- `lib/api/twitter.ts` - Twitter API integration
- `lib/auth/oauth.ts` - OAuth manager with PKCE support
- `lib/auth/platforms.ts` - Platform authentication logic
- `app/api/auth/twitter/callback/route.ts` - OAuth callback handler
- `components/OAuthVerificationButton.tsx` - OAuth button component

## Security Features

- **PKCE**: Prevents authorization code interception attacks
- **State Parameter**: Prevents CSRF attacks
- **Secure Storage**: OAuth state and verifiers are stored securely
- **No Credential Storage**: User credentials are never stored on the server

## Troubleshooting

### Common Issues

1. **"Twitter OAuth not configured"**: Check that your environment variables are set correctly
2. **"Invalid redirect URI"**: Ensure the callback URL in Twitter App settings matches your environment
3. **"Token exchange failed"**: Verify your Client ID and Secret are correct
4. **"Missing parameters"**: Check that the OAuth flow is completing properly

### Debug Mode

Enable debug logging by checking the browser console and server logs for detailed error messages.

## Production Deployment

For production deployment:

1. Update the callback URL in Twitter App settings to your production domain
2. Set `NEXT_PUBLIC_APP_URL` to your production URL
3. Use a proper database for OAuth state storage (currently using in-memory storage)
4. Consider using Redis for better OAuth state management
5. Implement proper session management for production use

## API Endpoints

- `GET /api/auth/twitter/callback` - OAuth callback handler
- `GET /api/user/profile` - User profile data (includes Twitter verification status)

## Database Schema

The Twitter verification data is stored in the `User` table:

```sql
twitterUsername   String?
isVerifiedTwitter Boolean  @default(false)
``` 