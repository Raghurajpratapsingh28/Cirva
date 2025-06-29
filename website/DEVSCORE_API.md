# Dev Score API Documentation

This document describes the API endpoints for managing developer scores in the Cirva application.

## Base URL
```
/api/user/devscore
```

## Endpoints

### 1. GET /api/user/devscore
Fetch dev score data for a user, including both database and blockchain scores.

**Query Parameters:**
- `publicKey` (required): The user's wallet address

**Response:**
```json
{
  "user": {
    "publicKey": "0x...",
    "devScore": 750,
    "githubUsername": "username",
    "isVerifiedGithub": true,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  },
  "blockchain": {
    "score": "750",
    "error": null
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing publicKey parameter
- `404`: User not found
- `500`: Server error

### 2. POST /api/user/devscore
Update a user's dev score in the database.

**Request Body:**
```json
{
  "publicKey": "0x...",
  "devScore": 750,
  "source": "manual"
}
```

**Parameters:**
- `publicKey` (required): The user's wallet address
- `devScore` (required): Score value (0-1000)
- `source` (optional): Source of the score update (default: "manual")

**Response:**
```json
{
  "success": true,
  "message": "Dev score updated successfully",
  "user": {
    "publicKey": "0x...",
    "devScore": 750,
    "githubUsername": "username",
    "isVerifiedGithub": true,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  },
  "source": "manual"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid parameters or score validation failed
- `404`: User not found
- `500`: Server error

### 3. PUT /api/user/devscore
Sync dev score from blockchain to database.

**Query Parameters:**
- `publicKey` (required): The user's wallet address

**Response:**
```json
{
  "success": true,
  "message": "Dev score synced from blockchain successfully",
  "user": {
    "publicKey": "0x...",
    "devScore": 750,
    "githubUsername": "username",
    "isVerifiedGithub": true,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  },
  "blockchainScore": "750",
  "synced": true
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing publicKey or user doesn't have verified GitHub
- `404`: User not found
- `500`: Server error or blockchain fetch failed

## Usage Examples

### JavaScript/TypeScript

```typescript
import { fetchDevScore, updateDevScore, syncDevScoreFromBlockchain } from '@/lib/api/devscore';

// Fetch dev score data
const data = await fetchDevScore('0x1234...');
console.log('Database score:', data.user.devScore);
console.log('Blockchain score:', data.blockchain.score);

// Update dev score
const result = await updateDevScore('0x1234...', 850, 'manual');
console.log('Updated score:', result.user.devScore);

// Sync from blockchain
const syncResult = await syncDevScoreFromBlockchain('0x1234...');
console.log('Synced score:', syncResult.user.devScore);
```

### React Hook

```typescript
import { useDevScore } from '@/hooks/useDevScore';

function MyComponent() {
  const { 
    apiData, 
    databaseScore, 
    blockchainScore, 
    scoreStatus,
    syncFromBlockchain,
    updateDatabaseScore 
  } = useDevScore();

  const handleSync = async () => {
    try {
      await syncFromBlockchain();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <div>
      <p>Database Score: {databaseScore}</p>
      <p>Blockchain Score: {blockchainScore}</p>
      <p>Status: {scoreStatus}</p>
      <button onClick={handleSync}>Sync from Blockchain</button>
    </div>
  );
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common error scenarios:
- **400 Bad Request**: Missing or invalid parameters
- **404 Not Found**: User doesn't exist in database
- **500 Internal Server Error**: Database or blockchain connection issues

## Validation Rules

### Dev Score Validation
- Must be an integer between 0 and 1000
- Cannot be null or undefined
- Must be provided in POST requests

### Public Key Validation
- Must be a valid Ethereum address format
- Required for all endpoints
- Must exist in the database for updates

### GitHub Verification
- User must have a verified GitHub account for blockchain sync
- GitHub username must be present in user profile

## Database Schema

The dev score is stored in the `User` table:

```sql
ALTER TABLE "User" ADD COLUMN "devScore" INTEGER;
```

## Integration with Smart Contracts

The API integrates with the GetDevScore smart contract on Sepolia testnet:

- **Contract Address**: `0x9103650b6Cd763F00458D634D55f4FE15A2d328e`
- **Network**: Sepolia testnet
- **Function**: `getScore(address _developerAddress)`

## Testing

Run the test script to verify API functionality:

```bash
node test-devscore-api.js
```

Make sure the development server is running on `localhost:3000` before testing.

## Security Considerations

1. **Input Validation**: All inputs are validated server-side
2. **Rate Limiting**: Consider implementing rate limiting for production
3. **Authentication**: Endpoints currently rely on public key validation
4. **CORS**: Configure CORS appropriately for production deployment

## Future Enhancements

1. **Caching**: Implement Redis caching for frequently accessed scores
2. **Webhooks**: Add webhook support for score updates
3. **Analytics**: Track score changes and trends
4. **Batch Operations**: Support for bulk score updates
5. **Versioning**: API versioning for backward compatibility 