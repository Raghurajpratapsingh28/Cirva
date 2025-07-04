'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Users, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useCommunityScore } from '@/hooks/useCommunityScore';
import { useAccount } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { toast } from 'sonner';

interface CommunityScoreButtonProps {
  discordUserId?: string;
  discordServerId?: string;
  onScoreCalculated?: (score: bigint) => void;
  score?: number | null;
}

export function CommunityScoreButton({ 
  discordUserId, 
  discordServerId, 
  onScoreCalculated, 
  score
}: CommunityScoreButtonProps) {
  const { address, isConnected, chainId } = useAccount();
  const { 
    isLoading, 
    error, 
    transactionHash, 
    requestId,
    isPolling,
    willReload,
    requestCommunityScore, 
    isCorrectNetwork,
    reloadPage
  } = useCommunityScore();

  const handleGetCommunityScore = async () => {
    if (!discordUserId || !discordServerId) {
      toast.error('Discord User ID and Server ID are required. Please verify your Discord account and invite our bot to a server first.');
      return;
    }

    try {
      await requestCommunityScore(discordUserId, discordServerId);
      toast.success('Community score calculation started! The page will reload in 2 minutes to update your score.');
      setTimeout(() => window.location.reload(), 120000);
    } catch (error) {
      console.error('Error getting community score:', error);
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
            <Users className="w-5 h-5" />
            Community Score
          </CardTitle>
          <CardDescription>
            Calculate your community score based on Discord server activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Connect your wallet to calculate your community score
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
            <Users className="w-5 h-5" />
            Community Score
          </CardTitle>
          <CardDescription>
            Calculate your community score based on Discord server activity
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

  // Check if we have the required data
  const hasRequiredData = discordUserId && discordServerId;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Community Score
          {score !== null && score !== undefined && (
            <Badge variant="secondary" className="ml-auto">
              {score.toString()}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Calculate your community score based on Discord server activity using Chainlink Functions
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
                  onClick={handleGetCommunityScore}
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

        {willReload && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <CheckCircle className="w-4 h-4 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Score calculated successfully!
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={reloadPage}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reload Page
              </Button>
            </div>
          </div>
        )}

        {score === null || score === undefined ? (
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm text-muted-foreground">No score found. Please click below to get your score.</span>
            <Button onClick={handleGetCommunityScore} disabled={isLoading || isPolling}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Get Score
            </Button>
          </div>
        ) : null}

        {/* Data Status Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <div>
              <p className="text-sm font-medium">Discord User ID</p>
              <p className="text-xs text-muted-foreground">
                {discordUserId ? 'Available from verified account' : 'Not available - verify Discord account'}
              </p>
            </div>
            <Badge variant={discordUserId ? "default" : "secondary"}>
              {discordUserId ? "Ready" : "Missing"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <div>
              <p className="text-sm font-medium">Discord Server ID</p>
              <p className="text-xs text-muted-foreground">
                {discordServerId ? 'Available from connected server' : 'Not available - invite bot to server'}
              </p>
            </div>
            <Badge variant={discordServerId ? "default" : "secondary"}>
              {discordServerId ? "Ready" : "Missing"}
            </Badge>
          </div>
        </div>

        <Button 
          onClick={handleGetCommunityScore}
          disabled={isLoading || isPolling || !hasRequiredData}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculating Community Score...
            </>
          ) : (
            <>
              <Users className="w-4 h-4 mr-2" />
              Get Community Score
            </>
          )}
        </Button>

        {score !== null && (
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Your Community Score: {score?.toString()}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Based on Discord server activity and engagement
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 