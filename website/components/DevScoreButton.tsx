'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Github, 
  Code, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useDevScore } from '@/hooks/useDevScore';
import { useAccount } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { toast } from 'sonner';
import { getStoredDevScore } from '@/lib/contracts/devScore';

interface DevScoreButtonProps {
  githubUsername?: string;
  onScoreCalculated?: (score: bigint) => void;
}

export function DevScoreButton({ githubUsername, onScoreCalculated }: DevScoreButtonProps) {
  const { address, isConnected, chainId } = useAccount();
  const { 
    isLoading, 
    score, 
    error, 
    transactionHash, 
    requestId,
    isPolling,
    willReload,
    requestDevScore, 
    loadExistingScore,
    isCorrectNetwork,
    reloadPage
  } = useDevScore();

  const handleGetDevScore = async () => {
    if (!githubUsername) {
      toast.error('Please verify your GitHub account first');
      return;
    }

    try {
      await requestDevScore(githubUsername);
      // The score will be updated via the hook's polling mechanism
    } catch (error) {
      console.error('Error getting dev score:', error);
    }
  };

  const handleScoreCalculated = (newScore: bigint) => {
    onScoreCalculated?.(newScore);
  };

  // Update parent when score changes
  if (score && onScoreCalculated) {
    handleScoreCalculated(score);
  }

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Developer Score
          </CardTitle>
          <CardDescription>
            Calculate your developer score based on GitHub activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Connect your wallet to calculate your developer score
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
            <Code className="w-5 h-5" />
            Developer Score
          </CardTitle>
          <CardDescription>
            Calculate your developer score based on GitHub activity
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
          <Code className="w-5 h-5" />
          Developer Score
          {score !== null && (
            <Badge variant="secondary" className="ml-auto">
              {score.toString()}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Calculate your developer score based on GitHub activity using Chainlink Functions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                    // Try to load the score manually
                    loadExistingScore();
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

        {score !== null && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Developer Score: {score.toString()}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Calculated on-chain using Chainlink Functions
              </p>
              {willReload && (
                <p className="text-xs text-blue-600 font-medium mt-1">
                  🔄 Page will reload automatically in 2 seconds to refresh all components...
                </p>
              )}
            </div>
            {!willReload && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={reloadPage}
                className="ml-2"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reload Page
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {!githubUsername ? (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Please verify your GitHub account first to calculate your developer score
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/verify'}
              >
                <Github className="w-4 h-4 mr-2" />
                Verify GitHub Account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <Github className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Using verified GitHub account
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {githubUsername}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleGetDevScore}
                disabled={isLoading || !!requestId}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : requestId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4 mr-2" />
                    Get Score
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Calculates score based on GitHub activity using Chainlink Functions</p>
          <p>• Score is computed off-chain and stored securely on-chain</p>
          <p>• Requires Sepolia testnet and gas fees</p>
          <p>• Processing time: 1-2 minutes after transaction confirmation</p>
          {isPolling && (
            <p className="text-blue-600 font-medium">
              🔄 Currently polling smart contract for score update...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 