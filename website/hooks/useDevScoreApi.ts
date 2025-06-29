import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface DevScoreData {
  publicKey: string;
  devScore: number | null;
  githubUsername: string | null;
  isVerifiedGithub: boolean;
  lastUpdated: string;
}

interface BlockchainData {
  score: string | null;
  error: string | null;
}

interface ApiResponse {
  user: DevScoreData;
  blockchain: BlockchainData;
}

interface UpdateResponse {
  success: boolean;
  message: string;
  user: DevScoreData;
  source: string;
}

interface SyncResponse {
  success: boolean;
  message: string;
  user: DevScoreData;
  blockchainScore: string;
  synced: boolean;
}

export function useDevScoreApi() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devScoreData, setDevScoreData] = useState<ApiResponse | null>(null);

  // Fetch dev score data
  const fetchDevScore = useCallback(async (publicKey?: string) => {
    const targetAddress = publicKey || address;
    if (!targetAddress) {
      setError('No wallet address available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/devscore?publicKey=${targetAddress}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dev score');
      }

      setDevScoreData(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Update dev score manually
  const updateDevScore = useCallback(async (
    devScore: number, 
    publicKey?: string,
    source: string = 'manual'
  ) => {
    const targetAddress = publicKey || address;
    if (!targetAddress) {
      setError('No wallet address available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/devscore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: targetAddress,
          devScore,
          source,
        }),
      });

      const data: UpdateResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update dev score');
      }

      // Refresh the dev score data after update
      await fetchDevScore(targetAddress);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address, fetchDevScore]);

  // Sync dev score from blockchain
  const syncDevScoreFromBlockchain = useCallback(async (publicKey?: string) => {
    const targetAddress = publicKey || address;
    if (!targetAddress) {
      setError('No wallet address available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/devscore?publicKey=${targetAddress}`, {
        method: 'PUT',
      });

      const data: SyncResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sync dev score from blockchain');
      }

      // Refresh the dev score data after sync
      await fetchDevScore(targetAddress);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address, fetchDevScore]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear data
  const clearData = useCallback(() => {
    setDevScoreData(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    devScoreData,
    
    // Actions
    fetchDevScore,
    updateDevScore,
    syncDevScoreFromBlockchain,
    clearError,
    clearData,
    
    // Convenience getters
    user: devScoreData?.user || null,
    blockchain: devScoreData?.blockchain || null,
    currentScore: devScoreData?.user?.devScore || null,
    blockchainScore: devScoreData?.blockchain?.score || null,
    hasVerifiedGithub: devScoreData?.user?.isVerifiedGithub || false,
    githubUsername: devScoreData?.user?.githubUsername || null,
  };
} 