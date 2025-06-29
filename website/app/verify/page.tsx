'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { VerificationStepper } from '@/components/VerificationStepper';
import { OAuthVerificationButton } from '@/components/OAuthVerificationButton';
import { DevScoreButton } from '@/components/DevScoreButton';
import { SocialScoreButton } from '@/components/SocialScoreButton';
import { CommunityScoreButton } from '@/components/CommunityScoreButton';
import { DefiScoreButton } from '@/components/DefiScoreButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  MessageCircle, 
  Twitter, 
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Bot,
  Users,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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

interface BotStatus {
  hasBotInvited: boolean;
  guildCount: number;
  discordUserId?: string;
  isVerifiedDiscord?: boolean;
  guilds: Array<{
    guildId: string;
    invitedAt: string;
  }>;
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
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [loadingBotStatus, setLoadingBotStatus] = useState(false);
  const [allGuilds, setAllGuilds] = useState<any[]>([]);
  const [loadingAllGuilds, setLoadingAllGuilds] = useState(false);
  const [discordUserId, setDiscordUserId] = useState('');
  const [discordServerId, setDiscordServerId] = useState('');
  const [devScore, setDevScore] = useState<number | null>(null);
  const [socialScore, setSocialScore] = useState<number | null>(null);
  const [communityScore, setCommunityScore] = useState<number | null>(null);
  const [defiScore, setDefiScore] = useState<number | null>(null);
  const [reputation, setReputation] = useState<any>(null);
  const [reputationLoading, setReputationLoading] = useState(false);
  const [reputationError, setReputationError] = useState<string | null>(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Check for verification results in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success') === 'true';
    const platform = urlParams.get('platform');
    const error = urlParams.get('error');
    const botInvite = urlParams.get('bot_invite');
    const message = urlParams.get('message');

    if (success && platform) {
      // Update platform status
      setPlatforms(prev => prev.map(p => 
        p.id === platform ? { ...p, status: 'verified' as const } : p
      ));
      
      const username = urlParams.get('username');
      // For GitHub, don't use score parameter since GetDevScore smart contract is the source of truth
      const score = platform === 'github' ? null : urlParams.get('score');
      
      toast.success(`${platform} verified successfully!`, {
        description: username ? `Connected as ${username}` : undefined
      });
      
      // Clean up URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      toast.error(`Verification failed: ${error}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (botInvite === 'success') {
      // Refresh bot status after successful invite
      if (address) {
        fetchBotStatus();
      }
      
      if (message === 'already_invited') {
        toast.success('Bot is already invited to this server!');
      } else {
        toast.success('Bot successfully invited to your server!');
      }
      
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [address]);

  const fetchBotStatus = async () => {
    if (!address) return;
    
    setLoadingBotStatus(true);
    try {
      console.log('🔍 Fetching bot status for address:', address);
      const response = await fetch(`/api/user/bot-status?publicKey=${address}`);
      const data = await response.json();
      
      console.log('📡 Bot status API response:', {
        status: response.status,
        data: data
      });
      
      if (response.ok && !data.error) {
        setBotStatus(data);
        console.log('✅ Bot status updated:', {
          hasBotInvited: data.hasBotInvited,
          guildCount: data.guildCount,
          guilds: data.guilds
        });

        // Auto-populate Discord User ID from bot-status API
        if (data.discordUserId && !discordUserId) {
          setDiscordUserId(data.discordUserId);
          console.log('✅ Auto-populated Discord User ID from bot-status:', data.discordUserId);
        }

        // Auto-populate Discord Server ID if user has connected servers and no server ID is set
        if (data.guilds && data.guilds.length > 0 && !discordServerId) {
          setDiscordServerId(data.guilds[0].guildId);
          console.log('✅ Auto-populated Discord Server ID:', data.guilds[0].guildId);
        }
      } else {
        console.error('❌ Failed to fetch bot status:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching bot status:', error);
    } finally {
      setLoadingBotStatus(false);
    }
  };

  const fetchAllGuilds = async () => {
    setLoadingAllGuilds(true);
    try {
      console.log('🔍 Fetching all guilds from database...');
      const response = await fetch('/api/guilds/list');
      const data = await response.json();
      
      console.log('📡 All guilds API response:', {
        status: response.status,
        data: data
      });
      
      if (response.ok && !data.error) {
        setAllGuilds(data.guilds || []);
        console.log('✅ All guilds updated:', data.guilds);
      } else {
        console.error('❌ Failed to fetch all guilds:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching all guilds:', error);
    } finally {
      setLoadingAllGuilds(false);
    }
  };

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

          setDevScore(data.devScore ?? null);
          setSocialScore(data.socialScore ?? null);
          setCommunityScore(data.communityScore ?? null);
          setDefiScore(data.defiRating ?? null);

          // Fallback: Auto-populate Discord User ID from profile if not already set from bot-status
          if (data.discordId && !discordUserId) {
            setDiscordUserId(data.discordId);
            console.log('✅ Auto-populated Discord User ID from profile:', data.discordId);
          }
        }
      });

    // Fetch bot status and all guilds (this will also set Discord User ID)
    fetchBotStatus();
    fetchAllGuilds();
  }, [address, discordUserId]);

  const handleVerificationComplete = (platformId: string, success: boolean, data?: any) => {
    if (success) {
      setPlatforms(prev => prev.map(p => 
        p.id === platformId ? { ...p, status: 'verified' as const } : p
      ));
    }
  };

  // Fetch reputation score for the connected wallet
  const fetchReputation = useCallback(async () => {
    if (!address) return;
    setReputationLoading(true);
    setReputationError(null);
    try {
      const res = await fetch(`/api/get-reputation?publicKey=${address}`);
      const data = await res.json();
      if (res.ok && data.reputation) {
        setReputation(data.reputation);
      } else {
        setReputation(null);
        setReputationError(data.error || 'Failed to fetch reputation');
      }
    } catch (err) {
      setReputation(null);
      setReputationError('Failed to fetch reputation');
    } finally {
      setReputationLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchReputation();
    }
  }, [address, fetchReputation]);

  // Generate reputation score
  const handleGenerateReputation = async () => {
    setGenerateLoading(true);
    setGenerateError(null);
    try {
      const res = await fetch('/api/generate-reputation-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: address }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Reputation generated successfully!');
        fetchReputation();
      } else {
        setGenerateError(data.error || 'Failed to generate reputation');
        toast.error(data.error || 'Failed to generate reputation');
      }
    } catch (err) {
      setGenerateError('Failed to generate reputation');
      toast.error('Failed to generate reputation');
    } finally {
      setGenerateLoading(false);
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
        
        {/* Bot Status Section */}
        <div className="mt-6">
          {loadingBotStatus ? (
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5 animate-spin" />
              <span className="text-muted-foreground">Checking bot status...</span>
            </div>
          ) : botStatus?.hasBotInvited ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-green-600 font-semibold">Bot is already invited!</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Connected to {botStatus.guildCount} server{botStatus.guildCount !== 1 ? 's' : ''}
              </div>
              
              {/* Guild IDs List */}
              {botStatus.guilds && botStatus.guilds.length > 0 && (
                <Card className="mt-4 max-w-md w-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Connected Servers ({botStatus.guildCount})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {botStatus.guilds.map((guild, index) => (
                        <div key={guild.guildId} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                          <code className="text-xs bg-background px-2 py-1 rounded border">
                            {guild.guildId}
                          </code>
                          <span className="text-xs text-muted-foreground">
                            {new Date(guild.invitedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchBotStatus}
                disabled={loadingBotStatus}
                className="mt-2"
              >
                <Clock className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-blue-500" />
                <span className="text-blue-600 font-semibold">Invite our Discord Bot</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md text-center">
                Invite our bot to your Discord server to enhance your verification experience
              </p>
              
              {/* Show all guilds from database */}
              {allGuilds.length > 0 && (
                <Card className="mt-4 max-w-md w-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-500" />
                      <span>All Server Connections ({allGuilds.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {allGuilds.map((guild, index) => (
                        <div key={`${guild.guildId}-${index}`} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                          <div className="flex flex-col space-y-1">
                            <code className="text-xs bg-background px-2 py-1 rounded border">
                              {guild.guildId}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              {guild.discordUsername || 'Unknown User'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(guild.invitedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Show existing guilds even if not invited by current user */}
              {botStatus?.guilds && botStatus.guilds.length > 0 && (
                <Card className="mt-4 max-w-md w-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Your Server Connections ({botStatus.guilds.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {botStatus.guilds.map((guild, index) => (
                        <div key={guild.guildId} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                          <code className="text-xs bg-background px-2 py-1 rounded border">
                            {guild.guildId}
                          </code>
                          <span className="text-xs text-muted-foreground">
                            {new Date(guild.invitedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex flex-wrap gap-2 justify-center">
                <a
                  href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&scope=bot%20applications.commands%20identify&permissions=2109828&response_type=code&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL + '/api/auth/discord/callback/bot-invite')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="sm">
                    Invite Bot to Server
                  </Button>
                </a>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchBotStatus}
                  disabled={loadingBotStatus}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Check Status
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchAllGuilds}
                  disabled={loadingAllGuilds}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Refresh All Guilds
                </Button>
              </div>
            </div>
          )}
        </div>
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

      {/* DevScore Integration */}
      <motion.div variants={fadeInUp}>
        <DevScoreButton 
          githubUsername={platforms.find(p => p.id === 'github')?.username}
          score={devScore}
          onScoreCalculated={(score) => {
            toast.success(`Developer score calculated: ${score.toString()}`);
            console.log('Dev score calculated:', score.toString());
          }}
        />
      </motion.div>

      {/* SocialScore Integration */}
      <motion.div variants={fadeInUp}>
        <SocialScoreButton 
          twitterUsername={platforms.find(p => p.id === 'twitter')?.username}
          score={socialScore}
          onScoreCalculated={(score) => {
            toast.success(`Social score calculated: ${score.toString()}`);
            console.log('Social score calculated:', score.toString());
          }}
        />
      </motion.div>

      {/* Community Score Section */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Community Score Configuration
            </CardTitle>
            <CardDescription>
              Your Discord information for community score calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Discord User ID Display */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Discord User ID</Label>
              {discordUserId ? (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <code className="text-sm font-mono">{discordUserId}</code>
                  <Badge variant="secondary" className="text-xs">
                    Auto-detected
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    Please verify your Discord account first
                  </span>
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                </div>
              )}
            </div>

            {/* Discord Server ID Display */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Discord Server ID</Label>
              {discordServerId ? (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <code className="text-sm font-mono">{discordServerId}</code>
                  <Badge variant="secondary" className="text-xs">
                    Selected
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    Please invite our bot to a Discord server first
                  </span>
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                </div>
              )}
            </div>

            {/* Server Selection from Connected Servers */}
            {botStatus?.guilds && botStatus.guilds.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select from your connected servers:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {botStatus.guilds.map((guild) => (
                    <Button
                      key={guild.guildId}
                      variant={discordServerId === guild.guildId ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDiscordServerId(guild.guildId)}
                      className="justify-start text-left"
                    >
                      <code className="text-xs mr-2">{guild.guildId}</code>
                      <span className="text-xs text-muted-foreground">
                        {new Date(guild.invitedAt).toLocaleDateString()}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Help Information */}
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  How Community Score works:
                </p>
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• <strong>Discord User ID:</strong> Automatically detected from your verified Discord account</p>
                  <p>• <strong>Server ID:</strong> Select from your connected Discord servers above</p>
                  <p>• <strong>Score Calculation:</strong> Based on avatar, nickname, badges, roles, tenure, and more</p>
                </div>
              </div>
            </div>

            {/* Community Score Button */}
            <CommunityScoreButton 
              discordUserId={discordUserId}
              discordServerId={discordServerId}
              score={communityScore}
              onScoreCalculated={(score) => {
                toast.success(`Community score calculated: ${score.toString()}`);
                console.log('Community score calculated:', score.toString());
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* DeFiScore Integration */}
      <motion.div variants={fadeInUp}>
        <DefiScoreButton 
          score={defiScore}
          onScoreCalculated={(score) => {
            toast.success(`DeFi score calculated: ${score.toString()}`);
            console.log('DeFi score calculated:', score.toString());
          }}
        />
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

      {/* Reputation Generation Section */}
      <motion.div variants={fadeInUp}>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Reputation Score</CardTitle>
          </CardHeader>
          <CardContent>
            {reputationLoading ? (
              <div className="text-muted-foreground">Loading reputation...</div>
            ) : reputationError ? (
              <div className="text-red-500">{reputationError}</div>
            ) : reputation && reputation.reputationScore != null ? (
              <div className="space-y-2">
                <div className="text-lg font-bold">Reputation Score: {reputation.reputationScore}</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div>Dev Rating: <span className="font-semibold">{reputation.devRating}</span></div>
                  <div>Community Rating: <span className="font-semibold">{reputation.communityRating}</span></div>
                  <div>Social Rating: <span className="font-semibold">{reputation.socialRating}</span></div>
                  <div>DeFi Rating: <span className="font-semibold">{reputation.defiRating}</span></div>
                  <div>Overall Rating: <span className="font-semibold">{reputation.overallRating}</span></div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No reputation score found. Generate your reputation below.</div>
            )}
            <Button
              className="mt-4"
              onClick={handleGenerateReputation}
              disabled={
                generateLoading ||
                reputationLoading ||
                !!reputation?.reputationScore ||
                !devScore || !socialScore || !communityScore || !defiScore
              }
            >
              {generateLoading ? 'Generating...' : 'Generate Reputation'}
            </Button>
            {generateError && <div className="text-red-500 mt-2">{generateError}</div>}
            {!devScore || !socialScore || !communityScore || !defiScore ? (
              <div className="text-yellow-600 mt-2 text-sm">Please complete all score verifications before generating reputation.</div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}