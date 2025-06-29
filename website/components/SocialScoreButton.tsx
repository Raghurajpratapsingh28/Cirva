'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Twitter, 
  MessageCircle, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useSocialScore } from '@/hooks/useSocialScore';
import { useAccount } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { toast } from 'sonner';

interface SocialScoreButtonProps {
  twitterUsername?: string;
  onScoreCalculated?: (score: bigint) => void;
  score?: number | null;
}

export function SocialScoreButton({ twitterUsername, onScoreCalculated, score }: SocialScoreButtonProps) {
  const { address, isConnected, chainId } = useAccount();
  const { 
    isLoading, 
    error, 
    transactionHash, 
    requestId,
    isPolling,
    willReload,
    requestSocialScore, 
    isCorrectNetwork,
    reloadPage
  } = useSocialScore();

  const handleGetSocialScore = async () => {
    if (!twitterUsername) {
      toast.error('Please verify your Twitter account first');
      return;
    }

    try {
      await requestSocialScore(twitterUsername);
      toast.success('Social score calculation started! The page will reload in 2 minutes to update your score.');
      setTimeout(() => window.location.reload(), 120000);
    } catch (error) {
      console.error('Error getting social score:', error);
    }
  };

  const handleScoreCalculated = (newScore: bigint) => {
    onScoreCalculated?.(newScore);
  };

  // Update parent when score changes
  if (typeof score === 'number' && onScoreCalculated) {
    handleScoreCalculated(BigInt(score));
  }

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Social Score
          </CardTitle>
          <CardDescription>
            Calculate your social score based on Twitter activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Connect your wallet to calculate your social score
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
            <MessageCircle className="w-5 h-5" />
            Social Score
          </CardTitle>
          <CardDescription>
            Calculate your social score based on Twitter activity
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
          <MessageCircle className="w-5 h-5" />
          Social Score
          {score !== null && score !== undefined && (
            <Badge variant="secondary" className="ml-auto">
              {score.toString()}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Calculate your social score based on Twitter activity using Chainlink Functions
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
                  onClick={handleGetSocialScore}
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
            <Button onClick={handleGetSocialScore} disabled={isLoading || isPolling}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Get Score
            </Button>
          </div>
        ) : null}

        {score !== null && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Social Score: {score?.toString()}
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
          {!twitterUsername ? (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Please verify your Twitter account first to calculate your social score
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/verify'}
              >
                <Twitter className="w-4 h-4 mr-2" />
                Verify Twitter Account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <Twitter className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Using verified Twitter account
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    @{twitterUsername}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleGetSocialScore}
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
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Get Social Score
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Calculates score based on Twitter activity using Chainlink Functions</p>
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