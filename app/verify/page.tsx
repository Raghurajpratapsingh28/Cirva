'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { VerificationStepper } from '@/components/VerificationStepper';
import { OAuthVerificationButton } from '@/components/OAuthVerificationButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  MessageCircle, 
  Twitter, 
  Shield,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'verified' | 'pending' | 'unverified';
  points: number;
  color: string;
  username?: string;
  profileUrl?: string;
}

export default function VerifyPage() {
  const { address, isConnected } = useAccount();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="w-6 h-6" />,
      description: 'Verify your developer contributions and open source activity through secure OAuth',
      status: 'unverified',
      points: 150,
      color: 'from-gray-700 to-gray-900'
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: <MessageCircle className="w-6 h-6" />,
      description: 'Connect your Discord account to show community involvement via OAuth authentication',
      status: 'unverified',
      points: 75,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="w-6 h-6" />,
      description: 'Link your Twitter to showcase your Web3 social presence through secure login',
      status: 'unverified',
      points: 100,
      color: 'from-blue-400 to-blue-600'
    }
  ]);

  // Check for verification results in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success') === 'true';
    const platform = urlParams.get('platform');
    const error = urlParams.get('error');

    if (success && platform) {
      // Update platform status
      setPlatforms(prev => prev.map(p => 
        p.id === platform ? { ...p, status: 'verified' as const } : p
      ));
      
      const username = urlParams.get('username');
      const score = urlParams.get('score');
      
      toast.success(`${platform} verified successfully!`, {
        description: username ? `Connected as ${username}` : undefined
      });
      
      // Clean up URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      toast.error(`Verification failed: ${error}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!address) return;
    // Fetch user profile from backend
    fetch(`/api/user/profile?publicKey=${address}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPlatforms(prev => prev.map(p => {
            if (p.id === 'github') {
              return {
                ...p,
                status: data.isVerifiedGithub ? 'verified' : 'unverified',
                username: data.githubUsername,
                profileUrl: data.githubUsername ? `https://github.com/${data.githubUsername}` : undefined,
              };
            }
            if (p.id === 'discord') {
              return {
                ...p,
                status: data.isVerifiedDiscord ? 'verified' : 'unverified',
                username: data.discordUsername,
                profileUrl: data.discordUsername ? `https://discord.com/users/${data.discordUsername}` : undefined,
              };
            }
            if (p.id === 'twitter') {
              return {
                ...p,
                status: data.isVerifiedTwitter ? 'verified' : 'unverified',
                username: data.twitterUsername,
                profileUrl: data.twitterUsername ? `https://twitter.com/${data.twitterUsername}` : undefined,
              };
            }
            return p;
          }));
        }
      });
  }, [address]);

  const handleVerificationComplete = (platformId: string, success: boolean, data?: any) => {
    if (success) {
      setPlatforms(prev => prev.map(p => 
        p.id === platformId ? { ...p, status: 'verified' as const } : p
      ));
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
          <p className="text-muted-foreground max-w-md">
            Connect your wallet to start verifying your platforms and building your reputation through secure OAuth authentication.
          </p>
        </div>
        <ConnectWalletButton size="lg" />
      </div>
    );
  }

  if (selectedPlatform) {
    return (
      <div className="max-w-4xl mx-auto">
        <VerificationStepper 
          platform={selectedPlatform}
          onBack={() => setSelectedPlatform(null)}
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto space-y-8"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Verify Your Platforms</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Connect your social and development platforms securely using OAuth 2.0 authentication. 
          Your credentials are never stored on our servers.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div 
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {platforms.filter(p => p.status === 'verified').length}
            </div>
            <div className="text-sm text-muted-foreground">Verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {platforms.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold">
              {platforms.reduce((acc, p) => p.status === 'verified' ? acc + p.points : acc, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Points Earned</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platforms Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={staggerContainer}
      >
        {platforms.map((platform) => (
          <motion.div key={platform.id} variants={fadeInUp}>
            <OAuthVerificationButton
              platform={platform}
              onVerificationComplete={(success, data) => 
                handleVerificationComplete(platform.id, success, data)
              }
            />
            {platform.status === 'verified' && platform.username && platform.profileUrl && (
              <Button
                asChild
                className="mt-2 w-full"
                variant="outline"
              >
                <a href={platform.profileUrl} target="_blank" rel="noopener noreferrer">
                  Go to {platform.name} Profile
                </a>
              </Button>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Security Info */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Secure OAuth 2.0 Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  We use industry-standard OAuth 2.0 for secure authentication. Your login credentials 
                  are never stored on our servers. We only access public profile information that you 
                  explicitly authorize. All verifications are stored securely on IPFS and linked to your wallet address.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    OAuth 2.0 Secure
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    No Credentials Stored
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    IPFS Verified
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}