// API functions for community score management

export interface CommunityScoreData {
  user: {
    publicKey: string;
    communityScore: number | null;
    discordId: string | null;
    isVerifiedDiscord: boolean;
    lastUpdated: string;
  };
  blockchain: {
    score: string | null;
    error: string | null;
  };
}

export interface CommunityScoreUpdateResponse {
  success: boolean;
  message: string;
  user: {
    publicKey: string;
    communityScore: number | null;
    discordId: string | null;
    isVerifiedDiscord: boolean;
    lastUpdated: string;
  };
  source: string;
}

export interface CommunityScoreSyncResponse {
  success: boolean;
  message: string;
  user: {
    publicKey: string;
    communityScore: number | null;
    discordId: string | null;
    isVerifiedDiscord: boolean;
    lastUpdated: string;
  };
  blockchainScore: string;
  synced: boolean;
}

// Fetch community score data for a user
export async function fetchCommunityScore(publicKey: string): Promise<CommunityScoreData> {
  const response = await fetch(`/api/user/communityscore?publicKey=${publicKey}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch community score');
  }
  
  return response.json();
}

// Update community score in database
export async function updateCommunityScore(
  publicKey: string, 
  communityScore: number, 
  source: string = 'manual'
): Promise<CommunityScoreUpdateResponse> {
  const response = await fetch('/api/user/communityscore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicKey,
      communityScore,
      source,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update community score');
  }
  
  return response.json();
}

// Sync community score from blockchain
export async function syncCommunityScoreFromBlockchain(publicKey: string): Promise<CommunityScoreSyncResponse> {
  const response = await fetch(`/api/user/communityscore?publicKey=${publicKey}`, {
    method: 'PUT',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to sync community score from blockchain');
  }
  
  return response.json();
}

// Compare database and blockchain scores
export function compareCommunityScores(
  databaseScore: number | null, 
  blockchainScore: string | null
): 'synced' | 'out-of-sync' | 'database-only' | 'blockchain-only' | 'none' {
  if (!databaseScore && !blockchainScore) {
    return 'none';
  }
  
  if (databaseScore && !blockchainScore) {
    return 'database-only';
  }
  
  if (!databaseScore && blockchainScore) {
    return 'blockchain-only';
  }
  
  if (databaseScore && blockchainScore) {
    const dbScore = databaseScore;
    const bcScore = parseInt(blockchainScore);
    
    if (dbScore === bcScore) {
      return 'synced';
    } else {
      return 'out-of-sync';
    }
  }
  
  return 'none';
}

// Get score status for display
export function getCommunityScoreStatus(
  databaseScore: number | null, 
  blockchainScore: string | null
): 'synced' | 'out-of-sync' | 'database-only' | 'blockchain-only' | 'none' {
  return compareCommunityScores(databaseScore, blockchainScore);
} 