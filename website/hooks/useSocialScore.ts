import { useState, useEffect, useRef } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { 
  getSocialScoreForTwitter, 
  getStoredSocialScore, 
  getCurrentUser,
  getLastRequestId,
  GET_SOCIAL_SCORE_ADDRESS,
  SUBSCRIPTION_ID
} from '@/lib/contracts/socialScore';
import { 
  fetchSocialScore, 
  updateSocialScore, 
  syncSocialScoreFromBlockchain,
  compareSocialScores,
  getSocialScoreStatus
} from '@/lib/api/socialscore';
import { toast } from 'sonner';

export interface SocialScoreState {
  isLoading: boolean;
  score: bigint | null;
  error: string | null;
  transactionHash: string | null;
  requestId: string | null;
  isPolling: boolean;
  willReload: boolean;
  // New API-related state
  apiData: any | null;
  databaseScore: number | null;
  blockchainScore: string | null;
  scoreStatus: 'synced' | 'out-of-sync' | 'database-only' | 'blockchain-only' | 'none';
  isApiLoading: boolean;
  apiError: string | null;
}

export function useSocialScore() {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [state, setState] = useState<SocialScoreState>({
    isLoading: false,
    score: null,
    error: null,
    transactionHash: null,
    requestId: null,
    isPolling: false,
    willReload: false,
    // New API-related state
    apiData: null,
    databaseScore: null,
    blockchainScore: null,
    scoreStatus: 'none',
    isApiLoading: false,
    apiError: null
  });

  // Refs for polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);
  const maxAttempts = 30; // 5 minutes with 10-second intervals

  // Check if we're on the correct network
  const isCorrectNetwork = chainId === sepolia.id;

  // Load existing score and API data when component mounts
  useEffect(() => {
    if (isConnected && address) {
      loadExistingScore();
      loadApiData();
    }
  }, [isConnected, address]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  const loadExistingScore = async () => {
    if (!address) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const score = await getStoredSocialScore(address);
      console.log('Loaded existing social score:', score.toString());
      setState(prev => ({ 
        ...prev, 
        score, 
        isLoading: false 
      }));
      
      // If there's an existing score, offer to reload the page
      if (score > 0n) {
        console.log('📊 Existing social score found, page can be reloaded if needed');
      }
    } catch (error) {
      console.error('Error loading existing social score:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load existing social score', 
        isLoading: false 
      }));
    }
  };

  const loadApiData = async () => {
    if (!address) return;
    
    try {
      setState(prev => ({ ...prev, isApiLoading: true, apiError: null }));
      const apiData = await fetchSocialScore(address);
      
      const scoreStatus = getSocialScoreStatus(
        apiData.user.socialScore, 
        apiData.blockchain.score
      );
      
      setState(prev => ({ 
        ...prev, 
        apiData,
        databaseScore: apiData.user.socialScore,
        blockchainScore: apiData.blockchain.score,
        scoreStatus,
        isApiLoading: false 
      }));
      
      console.log('📊 Social score API data loaded:', {
        databaseScore: apiData.user.socialScore,
        blockchainScore: apiData.blockchain.score,
        status: scoreStatus
      });
    } catch (error) {
      console.error('Error loading social score API data:', error);
      setState(prev => ({ 
        ...prev, 
        apiError: 'Failed to load API data', 
        isApiLoading: false 
      }));
    }
  };

  const syncFromBlockchain = async () => {
    if (!address) return;
    
    try {
      setState(prev => ({ ...prev, isApiLoading: true, apiError: null }));
      const result = await syncSocialScoreFromBlockchain(address);
      
      // Refresh API data after sync
      await loadApiData();
      
      toast.success('Social score synced from blockchain successfully');
      return result;
    } catch (error) {
      console.error('Error syncing from blockchain:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync from blockchain';
      setState(prev => ({ 
        ...prev, 
        apiError: errorMessage, 
        isApiLoading: false 
      }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateDatabaseScore = async (score: number, source: string = 'manual') => {
    if (!address) return;
    
    try {
      setState(prev => ({ ...prev, isApiLoading: true, apiError: null }));
      const result = await updateSocialScore(address, score, source);
      
      // Refresh API data after update
      await loadApiData();
      
      toast.success('Social score updated successfully');
      return result;
    } catch (error) {
      console.error('Error updating database score:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update score';
      setState(prev => ({ 
        ...prev, 
        apiError: errorMessage, 
        isApiLoading: false 
      }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const compareScoresData = async () => {
    if (!address) return null;
    
    try {
      const comparison = await compareSocialScores(address);
      console.log('Social score comparison:', comparison);
      return comparison;
    } catch (error) {
      console.error('Error comparing social scores:', error);
      throw error;
    }
  };

  const requestSocialScore = async (twitterUsername: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isCorrectNetwork) {
      toast.error('Please switch to Sepolia testnet');
      return;
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return;
    }

    if (!twitterUsername.trim()) {
      toast.error('Please provide a valid Twitter username');
      return;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        transactionHash: null,
        requestId: null,
        isPolling: false
      }));

      // Call the smart contract
      const hash = await getSocialScoreForTwitter(walletClient, twitterUsername.trim());
      
      setState(prev => ({ 
        ...prev, 
        transactionHash: hash
      }));

      toast.success('Social score request submitted! Transaction hash: ' + hash.slice(0, 10) + '...');

      // Wait for transaction to be mined and get the request ID
      await waitForTransaction(hash);
      
      // Start polling for the score
      startPolling();

    } catch (error: any) {
      console.error('Error requesting social score:', error);
      const errorMessage = error.message || 'Failed to request social score';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isLoading: false 
      }));
      toast.error(errorMessage);
    }
  };

  const waitForTransaction = async (hash: string) => {
    try {
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
      console.log('Transaction mined:', receipt);
      
      // Get the request ID from the transaction
      const requestId = await getLastRequestId();
      setState(prev => ({ ...prev, requestId }));
      
      toast.success('Transaction confirmed! Waiting for score calculation...');
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw error;
    }
  };

  const startPolling = () => {
    if (!address) return;
    
    // Reset polling state
    attemptsRef.current = 0;
    setState(prev => ({ 
      ...prev, 
      isPolling: true,
      isLoading: true 
    }));
    
    console.log('Starting polling for social score update...');
    pollForScoreUpdate();
  };

  const pollForScoreUpdate = async () => {
    if (!address || attemptsRef.current >= maxAttempts) {
      if (attemptsRef.current >= maxAttempts) {
        setState(prev => ({ 
          ...prev, 
          error: 'Score calculation timeout. Please try again later.',
          isLoading: false,
          isPolling: false
        }));
        toast.error('Score calculation timeout. Please try again later.');
      }
      return;
    }

    try {
      console.log(`Polling attempt ${attemptsRef.current + 1}/${maxAttempts}`);
      const currentScore = await getStoredSocialScore(address);
      console.log('Current social score from contract:', currentScore.toString());
      
      // If score has changed from 0, it means the calculation is complete
      if (currentScore > 0n) {
        console.log('Social score found! Stopping polling.');
        setState(prev => ({ 
          ...prev, 
          score: currentScore,
          isLoading: false,
          isPolling: false,
          willReload: true
        }));
        toast.success(`Social score calculated: ${currentScore.toString()}`);
        
        // Sync the new score to the database
        try {
          await syncFromBlockchain();
        } catch (error) {
          console.error('Failed to sync score to database:', error);
        }
        
        // Reload the page after a short delay to refresh all components
        console.log('🔄 Reloading page after social score calculation...');
        toast.info('Page will reload in 1.5 minutes to refresh all components...');
        setTimeout(() => {
          window.location.reload();
        }, 90000); // 90 second delay to show the success message
        
        return;
      }
      
      attemptsRef.current++;
      
      // Show progress every 30 seconds
      if (attemptsRef.current % 3 === 0) {
        const minutesLeft = Math.ceil((maxAttempts - attemptsRef.current) / 6);
        toast.info(`Still processing... (${minutesLeft} min remaining)`);
      }
      
      // Schedule next poll
      pollingRef.current = setTimeout(pollForScoreUpdate, 10000);
      
    } catch (error) {
      console.error('Error polling for social score update:', error);
      attemptsRef.current++;
      
      if (attemptsRef.current >= maxAttempts) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to get social score update',
          isLoading: false,
          isPolling: false
        }));
        return;
      }
      
      // Schedule next poll even on error
      pollingRef.current = setTimeout(pollForScoreUpdate, 10000);
    }
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    setState(prev => ({ 
      ...prev, 
      isPolling: false 
    }));
  };

  const reset = () => {
    stopPolling();
    setState({
      isLoading: false,
      score: null,
      error: null,
      transactionHash: null,
      requestId: null,
      isPolling: false,
      willReload: false,
      // Reset API state
      apiData: null,
      databaseScore: null,
      blockchainScore: null,
      scoreStatus: 'none',
      isApiLoading: false,
      apiError: null
    });
  };

  const reloadPage = () => {
    console.log('🔄 Manual page reload triggered');
    window.location.reload();
  };

  return {
    // Blockchain-related state and methods
    ...state,
    requestSocialScore,
    loadExistingScore,
    reset,
    stopPolling,
    isCorrectNetwork,
    isConnected,
    reloadPage,
    
    // API-related methods
    loadApiData,
    syncFromBlockchain,
    updateDatabaseScore,
    compareScoresData,
    
    // Convenience getters
    hasVerifiedTwitter: state.apiData?.user?.isVerifiedTwitter || false,
    twitterUsername: state.apiData?.user?.twitterUsername || null,
    isScoreSynced: state.scoreStatus === 'synced',
    hasDatabaseScore: state.databaseScore !== null,
    hasBlockchainScore: state.blockchainScore !== null && state.blockchainScore !== '0',
  };
} 