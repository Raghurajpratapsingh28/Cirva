import { getStoredDevScore } from '@/lib/contracts/devScore';

export interface DevScoreApiResponse {
  user: {
    publicKey: string;
    devScore: number | null;
    githubUsername: string | null;
    isVerifiedGithub: boolean;
    lastUpdated: string;
  };
  blockchain: {
    score: string | null;
    error: string | null;
  };
}

export interface DevScoreUpdateRequest {
  publicKey: string;
  devScore: number;
  source?: string;
}

export interface DevScoreUpdateResponse {
  success: boolean;
  message: string;
  user: {
    publicKey: string;
    devScore: number | null;
    githubUsername: string | null;
    isVerifiedGithub: boolean;
    lastUpdated: string;
  };
  source: string;
}

export interface DevScoreSyncResponse {
  success: boolean;
  message: string;
  user: {
    publicKey: string;
    devScore: number | null;
    githubUsername: string | null;
    isVerifiedGithub: boolean;
    lastUpdated: string;
  };
  blockchainScore: string;
  synced: boolean;
}

// Fetch dev score data from API
export async function fetchDevScore(publicKey: string): Promise<DevScoreApiResponse> {
  const response = await fetch(`/api/user/devscore?publicKey=${publicKey}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch dev score');
  }
  
  return response.json();
}

// Update dev score via API
export async function updateDevScore(
  publicKey: string, 
  devScore: number, 
  source: string = 'manual'
): Promise<DevScoreUpdateResponse> {
  const response = await fetch('/api/user/devscore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicKey,
      devScore,
      source,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update dev score');
  }

  return response.json();
}

// Sync dev score from blockchain via API
export async function syncDevScoreFromBlockchain(publicKey: string): Promise<DevScoreSyncResponse> {
  const response = await fetch(`/api/user/devscore?publicKey=${publicKey}`, {
    method: 'PUT',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync dev score from blockchain');
  }

  return response.json();
}

// Direct blockchain score fetch (bypasses API)
export async function getBlockchainScore(publicKey: string): Promise<bigint | null> {
  try {
    return await getStoredDevScore(publicKey as `0x${string}`);
  } catch (error) {
    console.error('Error fetching blockchain score:', error);
    return null;
  }
}

// Compare database score with blockchain score
export async function compareScores(publicKey: string): Promise<{
  databaseScore: number | null;
  blockchainScore: bigint | null;
  isInSync: boolean;
  difference: number | null;
}> {
  try {
    // Get database score
    const apiData = await fetchDevScore(publicKey);
    const databaseScore = apiData.user.devScore;
    
    // Get blockchain score
    const blockchainScore = await getBlockchainScore(publicKey);
    
    // Compare scores
    let isInSync = false;
    let difference: number | null = null;
    
    if (databaseScore !== null && blockchainScore !== null) {
      difference = Number(blockchainScore) - databaseScore;
      isInSync = difference === 0;
    } else if (databaseScore === null && blockchainScore === null) {
      isInSync = true;
    }
    
    return {
      databaseScore,
      blockchainScore,
      isInSync,
      difference,
    };
  } catch (error) {
    console.error('Error comparing scores:', error);
    throw error;
  }
}

// Validate dev score
export function validateDevScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= 1000;
}

// Format dev score for display
export function formatDevScore(score: number | bigint | string | null): string {
  if (score === null || score === undefined) {
    return 'N/A';
  }
  
  const numScore = typeof score === 'string' ? parseInt(score) : Number(score);
  
  if (isNaN(numScore)) {
    return 'N/A';
  }
  
  return numScore.toString();
}

// Get score status (for UI indicators)
export function getScoreStatus(
  databaseScore: number | null, 
  blockchainScore: bigint | string | null
): 'synced' | 'out-of-sync' | 'database-only' | 'blockchain-only' | 'none' {
  const dbScore = databaseScore !== null;
  const bcScore = blockchainScore !== null && blockchainScore !== '0';
  
  if (dbScore && bcScore) {
    const dbNum = Number(databaseScore);
    const bcNum = typeof blockchainScore === 'string' ? parseInt(blockchainScore) : Number(blockchainScore);
    return dbNum === bcNum ? 'synced' : 'out-of-sync';
  } else if (dbScore && !bcScore) {
    return 'database-only';
  } else if (!dbScore && bcScore) {
    return 'blockchain-only';
  } else {
    return 'none';
  }
} 