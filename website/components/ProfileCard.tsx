'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  Copy, 
  ExternalLink, 
  Calendar,
  TrendingUp,
  Star,
  Award,
  CheckCircle,
  Sparkles,
  Globe,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  address: string;
  profile?: {
    ens?: string | null;
    reputation: {
      overall: number;
      developer: number;
      contributor: number;
      social: number;
      defi: number;
    };
    badges: number;
    verifiedPlatforms: string[];
    lastUpdated: string;
  };
  isPublic?: boolean;
}

export function ProfileCard({ address, profile, isPublic = false }: ProfileCardProps) {
  const [ensName, setEnsName] = useState<string | null>(profile?.ens || null);
  const [avatar, setAvatar] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // In a real app, fetch ENS name and avatar from ENS resolver
    // For demo, we'll use mock data
    if (Math.random() > 0.7) {
      setEnsName(`user${address.slice(-4)}.eth`);
    }
    
    // Generate avatar based on address
    setAvatar(`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`);
  }, [address]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard', {
      description: 'Wallet address has been copied to your clipboard'
    });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-500';
    if (score >= 600) return 'text-blue-500';  
    if (score >= 400) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 900) return 'Elite';
    if (score >= 800) return 'Expert';
    if (score >= 600) return 'Advanced';
    if (score >= 400) return 'Intermediate';
    return 'Beginner';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 800) return 'from-green-400 to-emerald-600';
    if (score >= 600) return 'from-blue-400 to-cyan-600';  
    if (score >= 400) return 'from-yellow-400 to-orange-600';
    return 'from-red-400 to-pink-600';
  };

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="overflow-hidden border-2">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                  <AvatarImage src={avatar} alt="Profile" />
                  <AvatarFallback className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 text-white">
                    {address.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">
                  {ensName || formatAddress(address)}
                </h2>
                <p className="text-muted-foreground text-lg">
                  Profile data not available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden border-2 hover:border-primary/20 transition-all duration-500 card-hover">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 p-8">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
            animate={{ 
              backgroundPosition: isHovered ? ['0% 50%', '100% 50%'] : '0% 50%',
            }}
            transition={{ 
              duration: 2,
              ease: "linear"
            }}
          />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <Avatar className="h-24 w-24 border-4 border-background shadow-2xl">
                  <AvatarImage src={avatar} alt="Profile" />
                  <AvatarFallback className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 text-white">
                    {address.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {profile.verifiedPlatforms.length > 0 && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-background"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <h2 className="text-3xl font-bold">
                    {ensName || formatAddress(address)}
                  </h2>
                  {profile.verifiedPlatforms.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </motion.div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <span className="font-mono">{formatAddress(address)}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={copyAddress}
                    className="p-1 hover:bg-background/50 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                    className="p-1 hover:bg-background/50 rounded transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    Updated {new Date(profile.lastUpdated).toLocaleDateString()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Globe className="w-3 h-3 mr-1" />
                    Cross-Chain Synced
                  </Badge>
                </div>
              </div>
            </div>

            {/* Overall Score Display */}
            <div className="text-center lg:text-right">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className={cn(
                    "text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                    getScoreGradient(profile.reputation.overall)
                  )}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {profile.reputation.overall}
                </motion.div>
                <div className="text-sm text-muted-foreground font-medium">Reputation Score</div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-bold",
                    getScoreColor(profile.reputation.overall)
                  )}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {getScoreLevel(profile.reputation.overall)}
                </Badge>
              </motion.div>
            </div>
          </div>
        </div>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Stats */}
            <div className="space-y-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Reputation Breakdown
              </h3>
              <div className="space-y-4">
                {Object.entries(profile.reputation).slice(1).map(([category, score], index) => (
                  <motion.div 
                    key={category}
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <Badge variant="secondary" className="text-xs">
                        {score}
                      </Badge>
                    </div>
                    <Progress 
                      value={(score / 1000) * 100} 
                      className="h-2"
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator orientation="vertical" className="hidden lg:block" />

            {/* Verified Platforms */}
            <div className="space-y-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified Platforms
              </h3>
              <div className="space-y-3">
                {profile.verifiedPlatforms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.verifiedPlatforms.map((platform, index) => (
                      <motion.div
                        key={platform}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {platform}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No platforms verified yet
                  </span>
                )}
              </div>
            </div>

            <Separator orientation="vertical" className="hidden lg:block" />

            {/* Achievement Summary */}
            <div className="space-y-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center">
                <Award className="w-4 h-4 mr-2" />
                Achievements
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="text-center p-4 bg-muted/50 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-2xl font-bold text-purple-600">{profile.badges}</div>
                  <div className="text-xs text-muted-foreground">Badges Earned</div>
                </motion.div>
                <motion.div 
                  className="text-center p-4 bg-muted/50 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-2xl font-bold text-green-600">{profile.verifiedPlatforms.length}</div>
                  <div className="text-xs text-muted-foreground">Platforms</div>
                </motion.div>
              </div>
              
              {/* Recent Activity Indicators */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Recent Activity</h4>
                <div className="space-y-2">
                  {[
                    { label: "Profile updated", color: "bg-green-500" },
                    { label: "Badge earned", color: "bg-blue-500" },
                    { label: "Platform verified", color: "bg-purple-500" },
                  ].map((activity, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center space-x-2 text-xs"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className={`w-2 h-2 ${activity.color} rounded-full animate-pulse`}></div>
                      <span className="text-muted-foreground">{activity.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}