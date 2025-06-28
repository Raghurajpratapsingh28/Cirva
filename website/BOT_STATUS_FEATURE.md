# Discord Bot Status Feature

## Overview

This feature allows the application to check if the Discord bot is already invited to any of the user's Discord servers, preventing duplicate invitations and providing a better user experience.

## Backend Implementation

### API Endpoint: `/api/user/bot-status`

**Method:** GET  
**Parameters:** 
- `publicKey` (required): The user's wallet address

**Response:**
```json
{
  "hasBotInvited": boolean,
  "guildCount": number,
  "guilds": [
    {
      "guildId": string,
      "invitedAt": string
    }
  ]
}
```

**Error Responses:**
- `400`: Missing publicKey parameter
- `404`: User not found
- `500`: Server error

### Database Schema

The feature uses the existing `Guild` table in the Prisma schema:

```prisma
model Guild {
  id            Int      @id @default(autoincrement())
  guildId       String   @unique // Discord server ID
  discordUserId String   // Discord user ID who invited the bot
  userId        Int      // Reference to User table
  user          User     @relation(fields: [userId], references: [id])
  createdAt     DateTime @default(now())
}
```

### Bot Invite Callback Updates

The `/api/auth/discord/callback/bot-invite` endpoint now:
1. Checks for existing guild entries to prevent duplicates
2. Returns appropriate success messages for new vs. existing invites
3. Handles errors gracefully with proper logging

## Frontend Implementation

### Features

1. **Real-time Status Check**: Automatically checks bot status when user connects wallet
2. **Loading States**: Shows loading spinner while checking status
3. **Conditional UI**: 
   - Shows "Bot is already invited!" with server count if bot is invited
   - Shows "Invite our Discord Bot" with invite button if not invited
4. **Manual Refresh**: Users can manually refresh the status
5. **Success Notifications**: Toast notifications for successful invites

### UI States

#### Bot Already Invited
- ✅ Green checkmark icon
- "Bot is already invited!" message
- Server count display
- Refresh button for manual status check

#### Bot Not Invited
- 🤖 Bot icon
- "Invite our Discord Bot" message
- Description text
- Invite button + Check Status button

#### Loading State
- ⏰ Clock icon with spinner
- "Checking bot status..." message

## Testing

Run the test script to verify the API endpoint:

```bash
cd website
node test-bot-status.js
```

## Environment Variables

Ensure these environment variables are set:

```env
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
NEXT_PUBLIC_APP_URL=your_app_url
DATABASE_URL=your_database_url
```

## Usage Flow

1. User connects wallet
2. Frontend automatically fetches bot status
3. UI displays appropriate state (invited/not invited)
4. User can invite bot or refresh status manually
5. After successful invite, status automatically refreshes
6. User sees updated status with server count

## Benefits

- **Prevents Duplicate Invites**: Users won't try to invite the bot multiple times
- **Better UX**: Clear indication of bot status
- **Real-time Updates**: Status updates automatically after invites
- **Error Handling**: Graceful handling of edge cases
- **Performance**: Efficient database queries with proper indexing 