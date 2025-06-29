import { useState, useEffect, useRef } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import {
  getDefiScoreForWallet,
  getStoredDefiScore,
  GET_DEFI_SCORE_ADDRESS,
  SUBSCRIPTION_ID
} from '@/lib/contracts/defiScore';
import {
  fetchDefiScore
} from '@/lib/api/defiscore';
import { toast } from 'sonner';

export interface DefiScoreState {
  isLoading: boolean;
  score: bigint | null;
  error: string | null;
  transactionHash: string | null;
  requestId: string | null;
  isPolling: boolean;
  chainSlug: string;
}

const DEFAULT_CHAIN_SLUG = 'eth-mainnet';

export function useDefiScore() {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [state, setState] = useState<DefiScoreState>({
    isLoading: false,
    score: null,
    error: null,
    transactionHash: null,
    requestId: null,
    isPolling: false,
    chainSlug: DEFAULT_CHAIN_SLUG,
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
      const score = await getStoredDefiScore(address);
      setState(prev => ({ ...prev, score, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to load existing score', isLoading: false }));
    }
  };

  const requestDefiScore = async (walletAddress: string, chainSlug?: string) => {
    if (!walletClient) {
      toast.error('Wallet not connected');
      return;
    }
    setState(prev => ({ ...prev, isLoading: true, error: null, transactionHash: null, requestId: null }));
    try {
      const txHash = await getDefiScoreForWallet(walletClient, walletAddress, chainSlug || state.chainSlug);
      setState(prev => ({ ...prev, transactionHash: txHash, isPolling: true }));
      startPolling();
      toast.success('DeFi score request submitted!');
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error?.message || 'Failed to request DeFi score', isLoading: false }));
      toast.error(error?.message || 'Failed to request DeFi score');
    }
  };

  const startPolling = () => {
    attemptsRef.current = 0;
    pollForScoreUpdate();
  };

  const pollForScoreUpdate = async () => {
    if (!address) return;
    attemptsRef.current += 1;
    try {
      console.log("Polling for defi score...");
      const score = await getStoredDefiScore(address);
      console.log("Defi score: ", score);
      const updateDefiScoreResponse = await fetch("/api/user/defiscore", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey: address,
          score: Number(score)
        })
      });
      
      if (updateDefiScoreResponse.ok) {
        const defiScoreUpdateData = await updateDefiScoreResponse.json();
        console.log("defiScoreUpdateData: ", defiScoreUpdateData);
      }

      console.log("bool: ", Number(score) >= 0)
      if (Number(score) >= 0) {
        console.log("reached here")
        setState(prev => ({ ...prev, score, isPolling: false, isLoading: false }));
        toast.success('DeFi score updated!');
        window.location.reload();
        return;
      }
    } catch (error) {
      // ignore
    }
    if (attemptsRef.current < maxAttempts) {
      pollingRef.current = setTimeout(pollForScoreUpdate, 10000);
    } else {
      setState(prev => ({ ...prev, isPolling: false, isLoading: false, error: 'Timeout waiting for DeFi score update' }));
      toast.error('Timeout waiting for DeFi score update');
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const setChainSlug = (slug: string) => {
    setState(prev => ({ ...prev, chainSlug: slug }));
  };

  return {
    ...state,
    isCorrectNetwork,
    requestDefiScore,
    loadExistingScore,
    reloadPage,
    setChainSlug,
  };
} 