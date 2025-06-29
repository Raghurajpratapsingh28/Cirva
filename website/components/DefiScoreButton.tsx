'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Banknote
} from 'lucide-react';
import { useDefiScore } from '@/hooks/useDefiScore';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { publicClient, GET_DEFI_SCORE_ADDRESS } from '@/lib/contracts/defiScore';

const CHAIN_OPTIONS = [
  { label: 'Ethereum Mainnet', value: 'eth-mainnet' },
  { label: 'Polygon Mainnet', value: 'polygon-mainnet' },
  { label: 'BNB Smart Chain (BSC)', value: 'bsc-mainnet' },
  { label: 'Avalanche C-Chain', value: 'avalanche-mainnet' },
  { label: 'Arbitrum One', value: 'arbitrum-mainnet' },
  { label: 'Optimism Mainnet', value: 'optimism-mainnet' },
  { label: 'Base Mainnet', value: 'base-mainnet' },
  { label: 'Fantom Opera', value: 'fantom-mainnet' },
  { label: 'Gnosis Chain (xDai)', value: 'gnosis-mainnet' },
  { label: 'Cronos Mainnet', value: 'cronos-mainnet' },
  { label: 'Moonbeam', value: 'moonbeam-mainnet' },
];

export function DefiScoreButton({ score, onScoreCalculated }: { score?: number | null, onScoreCalculated?: (score: bigint) => void }) {
  const { address, isConnected, chainId } = useAccount();
  const {
    isLoading,
    error,
    transactionHash,
    requestId,
    isPolling,
    isCorrectNetwork,
    requestDefiScore,
    setChainSlug,
    chainSlug,
    reloadPage
  } = useDefiScore();

  const [selectedChain, setSelectedChain] = useState(chainSlug);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleGetDefiScore = async () => {
    if (!address) {
      toast.error('Connect your wallet first');
      return;
    }
    await requestDefiScore(address, selectedChain);
    toast.success('DeFi score calculation started! The page will reload in 2 minutes to update your score.');
    setTimeout(() => window.location.reload(), 120000);
  };

  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChain(e.target.value);
    setChainSlug(e.target.value);
  };

  const fetchLastError = async () => {
    try {
      const errorBytes = await publicClient.readContract({
        address: GET_DEFI_SCORE_ADDRESS,
        abi: [
          'function s_lastError() external view returns (bytes)'
        ],
        functionName: 's_lastError',
      });
      if (typeof errorBytes === 'string' && errorBytes.length > 2) {
        // Remove 0x and decode as UTF-8 if possible
        const hex = errorBytes;
        let decoded = '';
        try {
          decoded = Buffer.from(hex.replace(/^0x/, ''), 'hex').toString('utf8');
        } catch {
          decoded = hex;
        }
        setLastError(decoded);
      } else {
        setLastError(null);
      }
    } catch {
      setLastError(null);
    }
  };

  useEffect(() => {
    fetchLastError();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isLoading || isPolling) {
      fetchLastError();
    }
    // eslint-disable-next-line
  }, [isLoading, isPolling]);

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            DeFi Score
          </CardTitle>
          <CardDescription>
            Calculate your DeFi score based on on-chain activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Connect your wallet to calculate your DeFi score
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            DeFi Score
          </CardTitle>
          <CardDescription>
            Calculate your DeFi score based on on-chain activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Please switch to Sepolia testnet to use this feature
            </p>
            <Badge variant="outline" className="text-xs">
              Current: {chainId === 1 ? 'Ethereum Mainnet' : `Chain ID: ${chainId}`}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="w-5 h-5" />
          DeFi Score
          {score !== null && score !== undefined && (
            <Badge variant="secondary" className="ml-auto">
              {score.toString()}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Calculate your DeFi score using Chainlink Functions and Covalent API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <label htmlFor="chain-select" className="text-sm font-medium">
            Select Chain:
          </label>
          <select
            id="chain-select"
            value={selectedChain}
            onChange={handleChainChange}
            className="border rounded px-2 py-1 text-sm"
          >
            {CHAIN_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <div className="flex-1">
              <p className="text-sm text-destructive">{error}</p>
              {error.includes('timeout') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    // loadExistingScore();
                  }}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Check Score Manually
                </Button>
              )}
            </div>
          </div>
        )}

        {transactionHash && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Transaction submitted
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                View on Etherscan
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {requestId && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
            <Sparkles className="w-4 h-4 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Score calculation in progress
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Request ID: {requestId.slice(0, 10)}...
              </p>
              {isPolling && (
                <div className="mt-2 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-green-600" />
                  <span className="text-xs text-green-700 dark:text-green-300">
                    Polling smart contract for score update...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {score === null || score === undefined ? (
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm text-muted-foreground">No score found. Please click below to get your score.</span>
            <Button onClick={handleGetDefiScore} disabled={isLoading || isPolling}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Get Score
            </Button>
          </div>
        ) : null}

        {lastError && (
          <div className="p-2 bg-red-100 text-red-700 rounded text-xs">
            <b>Contract Error:</b> {lastError}
          </div>
        )}

        <Button
          onClick={handleGetDefiScore}
          disabled={isLoading || isPolling}
          className="w-full"
        >
          {isLoading || isPolling ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <TrendingUp className="w-4 h-4 mr-2" />
          )}
          Get DeFi Score
        </Button>
      </CardContent>
    </Card>
  );
} 