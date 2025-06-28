'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Github, 
  MessageCircle, 
  Twitter,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { oauthManager } from '@/lib/auth/oauth';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'verified' | 'pending' | 'unverified';
  points: number;
  color: string;
}

interface OAuthVerificationButtonProps {
  platform: Platform;
  onVerificationStart?: () => void;
  onVerificationComplete?: (success: boolean, data?: any) => void;
}

export function OAuthVerificationButton({ 
  platform, 
  onVerificationStart,
  onVerificationComplete 
}: OAuthVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();

  const handleOAuthLogin = async () => {
    if (platform.status === 'verified') {
      toast.info(`${platform.name} is already verified`);
      return;
    }

    setIsLoading(true);
    onVerificationStart?.();

    try {
      // Check if environment variables are set
      if (platform.id === 'twitter') {
        const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        
        if (!clientId || clientId === 'your_twitter_client_id_here') {
          toast.error('Twitter OAuth not configured. Please set up your Twitter API credentials.');
          setIsLoading(false);
          return;
        }
        
        if (!appUrl) {
          toast.error('App URL not configured. Please set NEXT_PUBLIC_APP_URL in your environment variables.');
          setIsLoading(false);
          return;
        }
      }

      if (platform.id === 'discord') {
        const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        
        if (!clientId || clientId === 'your_discord_client_id_here') {
          toast.error('Discord OAuth not configured. Please set up your Discord API credentials.');
          setIsLoading(false);
          return;
        }
        
        if (!appUrl) {
          toast.error('App URL not configured. Please set NEXT_PUBLIC_APP_URL in your environment variables.');
          setIsLoading(false);
          return;
        }
      }

      // Generate state and code verifier for security
      const randomState = oauthManager.generateState();
      let codeVerifier: string | undefined;
      let codeChallenge: string | undefined;

      // Use PKCE for Twitter OAuth 2.0
      if (platform.id === 'twitter') {
        codeVerifier = oauthManager.generateCodeVerifier();
        codeChallenge = await oauthManager.generateCodeChallenge(codeVerifier);
      }

      // Encode publicKey and code verifier in state for Twitter
      let state: string;
      if (platform.id === 'twitter' && codeVerifier) {
        // For Twitter, include code verifier in state: publicKey:address|randomState|codeVerifier
        const baseState = address ? `publicKey:${address}|${randomState}` : randomState;
        state = `${baseState}|${codeVerifier}`;
      } else {
        // For other platforms, just include publicKey
        state = address ? `publicKey:${address}|${randomState}` : randomState;
      }

      // Store OAuth state and verifier (for backward compatibility)
      oauthManager.storeOAuthState(platform.id, state, codeVerifier);

      // Get authorization URL
      const authUrl = oauthManager.getAuthUrl(platform.id, state, codeChallenge);

      // Open OAuth popup or redirect
      const popup = window.open(
        authUrl,
        `${platform.id}_oauth`,
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        // Fallback to redirect if popup is blocked
        window.location.href = authUrl;
        return;
      }

      // Monitor popup for completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsLoading(false);
          
          // Check for verification result in URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const success = urlParams.get('success') === 'true';
          const platformParam = urlParams.get('platform');
          
          if (success && platformParam === platform.id) {
            const username = urlParams.get('username');
            const score = urlParams.get('score');
            
            toast.success(`${platform.name} verified successfully!`);
            onVerificationComplete?.(true, { username, score });
            
            // Clean up URL parameters
            window.history.replaceState({}, '', window.location.pathname);
          } else if (urlParams.get('error')) {
            const error = urlParams.get('error');
            console.error(`${platform.name} OAuth error:`, error);
            toast.error(`Verification failed: ${error}`);
            onVerificationComplete?.(false, { error });
            
            // Clean up URL parameters
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
      }, 1000);

      // Cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        if (!popup.closed) {
          popup.close();
        }
        setIsLoading(false);
      }, 300000);

    } catch (error) {
      console.error(`OAuth error for ${platform.name}:`, error);
      toast.error(`Failed to start ${platform.name} verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      onVerificationComplete?.(false, { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const getStatusIcon = () => {
    switch (platform.status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'unverified':
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (platform.status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</Badge>;
      case 'unverified':
        return <Badge variant="outline">Not Verified</Badge>;
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Connecting...';
    if (platform.status === 'verified') return 'ViewDevScore';
    if (platform.status === 'pending') return 'Verification Pending';
    return `Connect ${platform.name}`;
  };

  return (
    <div className="p-6 border rounded-lg hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${platform.color} text-white`}>
            {platform.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">{platform.name}</h3>
              {getStatusIcon()}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusBadge()}
              <Badge variant="secondary" className="text-xs">
                +{platform.points} pts
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-sm mb-4">
        {platform.description}
      </p>

      {platform.status === 'verified' ? (
        <Button
          onClick={() => {}}
          className="w-full"
          variant="outline"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          ViewDevScore
        </Button>
      ) : (
        <Button
          onClick={handleOAuthLogin}
          disabled={isLoading || platform.status === 'pending'}
          className="w-full"
          variant="default"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ExternalLink className="w-4 h-4 mr-2" />
          )}
          {getButtonText()}
        </Button>
      )}

      {platform.status === 'verified' && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>Successfully verified and earning reputation points</span>
          </div>
        </div>
      )}
    </div>
  );
}