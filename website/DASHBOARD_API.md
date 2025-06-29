# Dashboard API Documentation

## Overview

The Dashboard API provides comprehensive access to all user data including profile information, reputation scores, ratings, blockchain data, verification status, and a sophisticated badge system. This replaces the need for multiple individual API calls.

## Endpoints

### GET /api/user/dashboard

Fetches all user data in a single request.

**Query Parameters:**
- `publicKey` (required): The user's wallet address

**Response:**
```json
{
  "user": {
    "publicKey": "0x...",
    "githubUsername": "username",
    "twitterUsername": "username", 
    "discordUsername": "username",
    "isVerifiedGithub": true,
    "isVerifiedTwitter": true,
    "isVerifiedDiscord": true,
    "discordData": {
      "id": "discord_user_id",
      "email": "user@example.com",
      "avatar": "avatar_url",
      "profileUrl": "profile_url",
      "verified": true,
      "discriminator": "1234",
      "guildCount": 5,
      "premiumType": 0,
      "mfaEnabled": true
    },
    "guilds": [
      {
        "id": 1,
        "guildId": "discord_server_id",
        "discordUserId": "discord_user_id",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "scores": {
    "database": {
      "dev": 850,
      "social": 720,
      "community": 680,
      "defi": 920
    },
    "blockchain": {
      "dev": 850,
      "social": 720,
      "community": 680,
      "defi": 920
    },
    "overall": 792
  },
  "ratings": {
    "dev": 4,
    "social": 3,
    "community": 5,
    "defi": 4,
    "overall": 4
  },
  "reputation": {
    "overall": 792,
    "developer": 850,
    "contributor": 680,
    "social": 720,
    "defi": 920
  },
  "verifiedPlatforms": ["GitHub", "Twitter", "Discord"],
  "badges": {
    "badges": {
      "platform": {
        "github": "Verified GitHub Developer",
        "twitter": "Social Media Influencer",
        "discord": "Community Builder"
      },
      "score": {
        "dev": "Senior Developer",
        "social": "Social Butterfly",
        "community": "Active Member",
        "defi": "DeFi Expert",
        "overall": "Web3 Expert"
      },
      "rating": {
        "dev": "4-Star Developer",
        "social": "3-Star Social",
        "community": "5-Star Community",
        "defi": "4-Star DeFi",
        "overall": "4-Star Overall"
      },
      "achievement": {
        "allPlatforms": "Triple Platform Verified",
        "highScores": "High Achiever",
        "perfectScore": null,
        "earlyAdopter": "Early Adopter",
        "consistent": "Consistent Performer"
      }
    },
    "totalBadges": 12,
    "breakdown": {
      "platform": 3,
      "score": 5,
      "rating": 4,
      "achievement": 0
    }
  },
  "syncStatus": {
    "needsSync": false,
    "details": {
      "dev": false,
      "social": false,
      "community": false,
      "defi": false
    },
    "errors": []
  },
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

### POST /api/user/sync

Syncs scores from blockchain to database.

**Query Parameters:**
- `publicKey` (required): The user's wallet address

**Response:**
```json
{
  "success": true,
  "message": "Scores synced successfully",
  "syncResults": {
    "dev": {
      "synced": true,
      "oldScore": 850,
      "newScore": 860,
      "error": null
    },
    "social": {
      "synced": true,
      "oldScore": 720,
      "newScore": 720,
      "error": null
    },
    "community": {
      "synced": true,
      "oldScore": 680,
      "newScore": 690,
      "error": null
    },
    "defi": {
      "synced": true,
      "oldScore": 920,
      "newScore": 920,
      "error": null
    }
  },
  "scores": {
    "database": {
      "dev": 860,
      "social": 720,
      "community": 690,
      "defi": 920
    },
    "overall": 797
  },
  "syncedAt": "2024-01-01T00:00:00Z"
}
```

## Badge System

The dashboard includes a comprehensive badge system based on scores, ratings, and platform verification:

### Platform Badges
- **Verified GitHub Developer**: Awarded when GitHub is verified
- **Social Media Influencer**: Awarded when Twitter is verified
- **Community Builder**: Awarded when Discord is verified

### Score-Based Badges
- **Elite Developer** (900+): Highest developer score
- **Senior Developer** (800-899): High developer score
- **Mid-Level Developer** (700-799): Good developer score
- **Junior Developer** (600-699): Basic developer score
- **Code Enthusiast** (500-599): Beginner developer score

Similar badges exist for Social, Community, DeFi, and Overall scores.

### Rating-Based Badges
- **5-Star Developer** (5/5): Perfect rating
- **4-Star Developer** (4/5): Excellent rating
- **3-Star Developer** (3/5): Good rating
- **2-Star Developer** (2/5): Fair rating
- **1-Star Developer** (1/5): Basic rating

Similar badges exist for Social, Community, DeFi, and Overall ratings.

### Achievement Badges
- **Triple Platform Verified**: Verified on all 3 platforms
- **High Achiever**: 3+ scores above 800
- **Perfectionist**: Any score above 950
- **Early Adopter**: Verified on 2+ platforms
- **Consistent Performer**: All scores above 600

## Usage in Frontend

### Using the Custom Hook

```typescript
import { useDashboardData } from '@/hooks/useDashboardData';

function Dashboard() {
  const { data, loading, error, refreshData } = useDashboardData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>Overall Score: {data.scores.overall}</h1>
      <p>Overall Rating: {data.ratings.overall}/5</p>
      <p>Total Badges: {data.badges.totalBadges}</p>
      <p>Verified Platforms: {data.verifiedPlatforms.join(', ')}</p>
      {data.syncStatus.needsSync && (
        <div>⚠️ Scores need syncing</div>
      )}
    </div>
  );
}
```

### Manual API Calls

```typescript
// Fetch dashboard data
const response = await fetch(`/api/user/dashboard?publicKey=${address}`);
const data = await response.json();

// Access ratings
console.log('Developer Rating:', data.ratings.dev);

// Access badges
console.log('Total Badges:', data.badges.totalBadges);
console.log('Platform Badges:', data.badges.badges.platform);

// Sync scores
const syncResponse = await fetch(`/api/user/sync?publicKey=${address}`, {
  method: 'POST',
});
const syncResult = await syncResponse.json();
```

## Features

### Comprehensive Data Fetching
- User profile information
- All reputation scores (dev, social, community, defi)
- All ratings (dev, social, community, defi, overall)
- Blockchain score comparison
- Verification status for all platforms
- Discord guild information
- Sync status indicators

### Advanced Badge System
- Platform verification badges
- Score-based achievement badges
- Rating-based recognition badges
- Special achievement badges
- Badge breakdown by category
- Total badge count

### Blockchain Integration
- Fetches scores from smart contracts
- Compares database vs blockchain scores
- Identifies when scores are out of sync
- Provides detailed sync results

### Rating System
- 1-5 star ratings for each category
- Overall rating calculation
- Visual star display
- Rating-based badge awards

### Error Handling
- Graceful handling of blockchain errors
- Detailed error messages
- Fallback to database scores when blockchain fails

### Real-time Updates
- Refresh functionality
- Sync status monitoring
- Automatic data updates after sync operations

## Error Codes

- `400`: Missing publicKey parameter
- `404`: User not found
- `500`: Server error

## Testing

Use the test script to verify API functionality:

```bash
node test-dashboard-api.js
```

Make sure to update the test public key with a real address that exists in your database.

## Badge Logic

The badge system automatically calculates badges based on:

1. **Platform Verification**: Badges for each verified platform
2. **Score Thresholds**: Badges based on score ranges (500-950+)
3. **Rating Levels**: Badges based on star ratings (1-5)
4. **Achievements**: Special badges for meeting multiple criteria

Badges are calculated in real-time and update automatically when scores or ratings change. 