import { useState, useEffect, useRef } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { 
  getCommunityScoreForDiscord, 
  getStoredCommunityScore, 
  getCurrentUser,
  getLastRequestId,
  GET_COMMUNITY_SCORE_ADDRESS,
  SUBSCRIPTION_ID,
  getLastResponse,
  getLastError
} from '@/lib/contracts/communityScore';
import { toast } from 'sonner';

export interface CommunityScoreState {
  isLoading: boolean;
  score: bigint | null;
  error: string | null;
  transactionHash: string | null;
  requestId: string | null;
  isPolling: boolean;
  willReload: boolean;
}

export function useCommunityScore() {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [state, setState] = useState<CommunityScoreState>({
    isLoading: false,
    score: null,
    error: null,
    transactionHash: null,
    requestId: null,
    isPolling: false,
    willReload: false
  });

  // Refs for polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);
  const maxAttempts = 30; // 5 minutes with 10-second intervals

  // Check if we're on the correct network
  const isCorrectNetwork = chainId === sepolia.id;

  // Load existing score when component mounts
  useEffect(() => {
    if (isConnected && address) {
      loadExistingScore();
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
      const score = await getStoredCommunityScore(address);
      console.log('Loaded existing community score:', score.toString());
      setState(prev => ({ 
        ...prev, 
        score, 
        isLoading: false 
      }));
      
      // If there's an existing score, offer to reload the page
      if (score > 0n) {
        console.log('📊 Existing community score found, page can be reloaded if needed');
      }
    } catch (error) {
      console.error('Error loading existing community score:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load existing community score', 
        isLoading: false 
      }));
    }
  };

  const requestCommunityScore = async (discordUserId: string, discordServerId: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    if (!isCorrectNetwork) {
      throw new Error('Please switch to Sepolia testnet');
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null, 
        transactionHash: null,
        requestId: null,
        willReload: false
      }));

      console.log('🚀 Requesting community score for Discord user:', discordUserId, 'in server:', discordServerId);

      const hash = await getCommunityScoreForDiscord(walletClient, discordUserId, discordServerId);
      
      console.log('✅ Transaction submitted:', hash);
      
      setState(prev => ({ 
        ...prev, 
        transactionHash: hash,
        isLoading: false 
      }));

      toast.success('Community score request submitted!');

      // Start polling for the score update
      await waitForTransaction(hash);
      startPolling();

    } catch (error) {
      console.error('Error requesting community score:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to request community score';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isLoading: false 
      }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const waitForTransaction = async (hash: `0x${string}`) => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }
    
    try {
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('✅ Transaction confirmed:', receipt);
      
      // Get the request ID from the transaction
      const requestId = await getLastRequestId();
      console.log('📋 Request ID:', requestId);
      
      setState(prev => ({ 
        ...prev, 
        requestId 
      }));

    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw error;
    }
  };

  const startPolling = () => {
    setState(prev => ({ ...prev, isPolling: true }));
    attemptsRef.current = 0;
    pollForScoreUpdate();
  };

  const pollForScoreUpdate = async () => {
    if (!address || attemptsRef.current >= maxAttempts) {
      stopPolling();
      if (attemptsRef.current >= maxAttempts) {
        setState(prev => ({ 
          ...prev, 
          error: 'Score calculation timeout. Please try again later.',
          willReload: true
        }));
        toast.error('Score calculation timeout. Please try again later.');
      }
      return;
    }

    try {
      attemptsRef.current++;
      console.log(`🔄 Polling attempt ${attemptsRef.current}/${maxAttempts}`);

      const currentScore = await getStoredCommunityScore(address);
      const lastRequestId = await getLastRequestId();
      
      // Get additional debugging info
      const lastResponse = await getLastResponse();
      const lastError = await getLastError();
      
      console.log('📊 Current score:', currentScore.toString());
      console.log('📋 Last request ID:', lastRequestId);
      console.log('📄 Last response:', lastResponse);
      console.log('❌ Last error:', lastError);

      // Check if there was an error in the request
      if (lastError && lastError !== '0x') {
        console.error('🚨 Chainlink Functions request failed:', lastError);
        setState(prev => ({ 
          ...prev, 
          error: 'Chainlink Functions request failed. Please try again.',
          isPolling: false
        }));
        stopPolling();
        toast.error('Chainlink Functions request failed. Please try again.');
        return;
      }

      // Check if the score has been updated (greater than 0 and different from initial state)
      if (currentScore > 0n) {
        console.log('🎉 Community score updated:', currentScore.toString());
        setState(prev => ({ 
          ...prev, 
          score: currentScore,
          isPolling: false,
          willReload: true
        }));
        stopPolling();
        toast.success(`Community score calculated: ${currentScore.toString()}`);
        return;
      }

      // Continue polling
      pollingRef.current = setTimeout(pollForScoreUpdate, 10000); // 10 seconds

    } catch (error) {
      console.error('Error polling for score update:', error);
      // Continue polling even if there's an error
      pollingRef.current = setTimeout(pollForScoreUpdate, 10000);
    }
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    setState(prev => ({ ...prev, isPolling: false }));
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
      willReload: false
    });
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return {
    ...state,
    requestCommunityScore,
    loadExistingScore,
    reset,
    reloadPage,
    isCorrectNetwork
  };
} 