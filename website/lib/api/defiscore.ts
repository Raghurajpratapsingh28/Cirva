import { getStoredDefiScore } from '@/lib/contracts/defiScore';

export interface DefiScoreApiResponse {
  user: {
    publicKey: string;
    defiRating: number | null;
    lastUpdated: string;
  };
  blockchain: {
    score: string | null;
    error: string | null;
  };
}

export interface DefiScoreUpdateRequest {
  publicKey: string;
  defiRating: number;
  source?: string;
}

export interface DefiScoreUpdateResponse {
  success: boolean;
  message: string;
  user: {
    publicKey: string;
    defiRating: number | null;
    lastUpdated: string;
  };
  source: string;
}

export interface DefiScoreSyncResponse {
  success: boolean;
  message: string;
  user: {
    publicKey: string;
    defiRating: number | null;
    lastUpdated: string;
  };
  blockchainScore: string;
  synced: boolean;
}

// Fetch defi score data from API
export async function fetchDefiScore(publicKey: string): Promise<DefiScoreApiResponse> {
  const response = await fetch(`/api/user/defiscore?publicKey=${publicKey}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch defi score');
  }
  return response.json();
}

// Update defi score via API
export async function updateDefiScore(
  publicKey: string, 
  defiRating: number, 
  source: string = 'manual'
): Promise<DefiScoreUpdateResponse> {
  const response = await fetch('/api/user/defiscore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicKey,
      defiRating,
      source,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update defi score');
  }
  return response.json();
}

// Sync defi score from blockchain via API
export async function syncDefiScoreFromBlockchain(publicKey: string): Promise<DefiScoreSyncResponse> {
  const response = await fetch(`/api/user/defiscore?publicKey=${publicKey}`, {
    method: 'PUT',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync defi score from blockchain');
  }
  return response.json();
}

// Direct blockchain score fetch (bypasses API)
export async function getBlockchainDefiScore(publicKey: string): Promise<bigint | null> {
  try {
    return await getStoredDefiScore(publicKey as `0x${string}`);
  } catch (error) {
    console.error('Error fetching blockchain defi score:', error);
    return null;
  }
}

// Compare database score with blockchain score
export async function compareDefiScores(publicKey: string): Promise<{
  databaseScore: number | null;
  blockchainScore: bigint | null;
  isInSync: boolean;
  difference: number | null;
}> {
  try {
    // Get database score
    const apiData = await fetchDefiScore(publicKey);
    const databaseScore = apiData.user.defiRating;
    // Get blockchain score
    const blockchainScore = await getBlockchainDefiScore(publicKey);
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
    console.error('Error comparing defi scores:', error);
    throw error;
  }
}

// Validate defi score
export function validateDefiScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= 300;
}

// Format defi score for display
export function formatDefiScore(score: number | bigint | string | null): string {
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
export function getDefiScoreStatus(
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