# Social Score Backend Integration

This document describes the backend integration for storing and managing social scores in the CIRVA application.

## Database Schema

The `User` model in the Prisma schema has been updated to include a `socialScore` field:

```prisma
model User {
  // ... existing fields ...
  socialScore       Int?     // Calculated social score (0-1000)
  // ... existing fields ...
}
```

## API Endpoints

### 1. GET /api/user/socialscore

Fetches social score data for a user.

**Query Parameters:**
- `publicKey` (required): The user's wallet address

**Response:**
```json
{
  "user": {
    "publicKey": "0x...",
    "socialScore": 750,
    "twitterUsername": "username",
    "isVerifiedTwitter": true,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  },
  "blockchain": {
    "score": "750",
    "error": null
  }
}
```

### 2. POST /api/user/socialscore

Updates a user's social score in the database.

**Request Body:**
```json
{
  "publicKey": "0x...",
  "socialScore": 750,
  "source": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Social score updated successfully",
  "user": {
    "publicKey": "0x...",
    "socialScore": 750,
    "twitterUsername": "username",
    "isVerifiedTwitter": true,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  },
  "source": "manual"
}
```

### 3. PUT /api/user/socialscore

Syncs the social score from the blockchain to the database.

**Query Parameters:**
- `publicKey` (required): The user's wallet address

**Response:**
```json
{
  "success": true,
  "message": "Social score synced from blockchain successfully",
  "user": {
    "publicKey": "0x...",
    "socialScore": 750,
    "twitterUsername": "username",
    "isVerifiedTwitter": true,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  },
  "blockchainScore": "750",
  "synced": true
}
```

## API Helper Functions

The `lib/api/socialscore.ts` file provides helper functions for interacting with the social score API:

- `fetchSocialScore(publicKey)`: Fetches social score data
- `updateSocialScore(publicKey, score, source)`: Updates social score
- `syncSocialScoreFromBlockchain(publicKey)`: Syncs from blockchain
- `compareSocialScores(publicKey)`: Compares database vs blockchain scores
- `validateSocialScore(score)`: Validates score range (0-1000)
- `formatSocialScore(score)`: Formats score for display
- `getSocialScoreStatus(dbScore, bcScore)`: Gets sync status

## Integration with Frontend

The `useSocialScore` hook has been updated to integrate with the backend:

- Automatically loads API data on component mount
- Syncs scores from blockchain to database after calculation
- Provides methods for manual score updates
- Tracks sync status between database and blockchain

## Smart Contract Integration

The social score is calculated using the `GetSocialScore` smart contract:

- Contract Address: `0xfA145E64eee885Db2190580B1bF2C9373a6D78CA`
- Network: Sepolia Testnet
- Subscription ID: `5186`
- Input: Twitter username (0th element in args array)

## Usage Flow

1. User verifies their Twitter account
2. User clicks "Get Social Score" button
3. Smart contract calculates score using Twitter API
4. Score is stored on-chain
5. Frontend polls for score completion
6. Score is automatically synced to database
7. UI updates to show the calculated score

## Testing

Run the backend integration tests:

```bash
node test-social-score-backend.js
```

Run the smart contract tests:

```bash
node test-social-score.js
```

## Error Handling

- API endpoints return appropriate HTTP status codes
- Frontend shows user-friendly error messages
- Blockchain errors are logged and handled gracefully
- Database errors are caught and reported

## Security

- All API endpoints validate input data
- Scores are validated to be within 0-1000 range
- User authentication is handled by wallet connection
- No sensitive data is stored in the database 