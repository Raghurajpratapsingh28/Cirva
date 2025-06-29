import { getStoredSocialScore } from '@/lib/contracts/socialScore';

export interface SocialScoreApiResponse {
  user: {
    publicKey: string;
    socialScore: number | null;
    twitterUsername: string | null;
    isVerifiedTwitter: boolean;
    lastUpdated: string;
  };
  blockchain: {
    score: string | null;
    error: string | null;
  };
}

export interface SocialScoreUpdateRequest {
  publicKey: string;
  socialScore: number;
  source?: string;
}

export interface SocialScoreUpdateResponse {
  success: boolean;
  message: string;
  user: {
    publicKey: string;
    socialScore: number | null;
    twitterUsername: string | null;
    isVerifiedTwitter: boolean;
    lastUpdated: string;
  };
  source: string;
}

export interface SocialScoreSyncResponse {
  success: boolean;
  message: string;
  user: {
    publicKey: string;
    socialScore: number | null;
    twitterUsername: string | null;
    isVerifiedTwitter: boolean;
    lastUpdated: string;
  };
  blockchainScore: string;
  synced: boolean;
}

// Fetch social score data from API
export async function fetchSocialScore(publicKey: string): Promise<SocialScoreApiResponse> {
  const response = await fetch(`/api/user/socialscore?publicKey=${publicKey}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch social score');
  }
  
  return response.json();
}

// Update social score via API
export async function updateSocialScore(
  publicKey: string, 
  socialScore: number, 
  source: string = 'manual'
): Promise<SocialScoreUpdateResponse> {
  const response = await fetch('/api/user/socialscore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicKey,
      socialScore,
      source,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update social score');
  }

  return response.json();
}

// Sync social score from blockchain via API
export async function syncSocialScoreFromBlockchain(publicKey: string): Promise<SocialScoreSyncResponse> {
  const response = await fetch(`/api/user/socialscore?publicKey=${publicKey}`, {
    method: 'PUT',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync social score from blockchain');
  }

  return response.json();
}

// Direct blockchain score fetch (bypasses API)
export async function getBlockchainSocialScore(publicKey: string): Promise<bigint | null> {
  try {
    return await getStoredSocialScore(publicKey as `0x${string}`);
  } catch (error) {
    console.error('Error fetching blockchain social score:', error);
    return null;
  }
}

// Compare database score with blockchain score
export async function compareSocialScores(publicKey: string): Promise<{
  databaseScore: number | null;
  blockchainScore: bigint | null;
  isInSync: boolean;
  difference: number | null;
}> {
  try {
    // Get database score
    const apiData = await fetchSocialScore(publicKey);
    const databaseScore = apiData.user.socialScore;
    
    // Get blockchain score
    const blockchainScore = await getBlockchainSocialScore(publicKey);
    
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
    console.error('Error comparing social scores:', error);
    throw error;
  }
}

// Validate social score
export function validateSocialScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= 1000;
}

// Format social score for display
export function formatSocialScore(score: number | bigint | string | null): string {
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
export function getSocialScoreStatus(
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