'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { ProfileCard } from '@/components/ProfileCard';
import { ReputationGraph } from '@/components/ReputationGraph';
import { BadgeGrid } from '@/components/BadgeGrid';
import { SyncStatusBadge } from '@/components/SyncStatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw, 
  Zap, 
  Award, 
  TrendingUp,
  Shield,
  Globe,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock user data - in real app, fetch from IPFS/blockchain
  const [userProfile, setUserProfile] = useState({
    reputation: {
      overall: 845,
      developer: 920,
      contributor: 780,
      social: 650,
      defi: 890
    },
    badges: 12,
    verifiedPlatforms: ['GitHub', 'Discord'],
    lastUpdated: new Date().toISOString(),
    ens: null as string | null
  });

  const handleRefreshScores = async () => {
    setIsRefreshing(true);
    try {
      // Mock API call - in real app, trigger Chainlink Automation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate score update
      setUserProfile(prev => ({
        ...prev,
        reputation: {
          ...prev.reputation,
          overall: prev.reputation.overall + Math.floor(Math.random() * 20)
        },
        lastUpdated: new Date().toISOString()
      }));
      
      toast.success('Reputation scores updated successfully!');
    } catch (error) {
      toast.error('Failed to refresh scores. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSyncChains = async () => {
    setIsSyncing(true);
    try {
      // Mock CCIP cross-chain sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Profile synced across all chains!');
    } catch (error) {
      toast.error('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMintSoulbound = async () => {
    try {
      // Mock soulbound NFT minting
      toast.success('Soulbound NFT minted successfully!');
    } catch (error) {
      toast.error('Failed to mint NFT. Please try again.');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
          <p className="text-muted-foreground max-w-md">
            Connect your wallet to access your CIRVA dashboard and manage your Web3 reputation.
          </p>
        </div>
        <ConnectWalletButton size="lg" />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Web3 identity and reputation
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <SyncStatusBadge />
          <ConnectWalletButton />
        </div>
      </motion.div>

      {/* Profile Overview */}
      <motion.div variants={fadeInUp}>
        <ProfileCard address={address!} profile={userProfile} />
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={staggerContainer}
      >
        {[
          {
            title: "Overall Score",
            value: userProfile.reputation.overall,
            icon: <Star className="w-5 h-5" />,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
          },
          {
            title: "Developer Score", 
            value: userProfile.reputation.developer,
            icon: <TrendingUp className="w-5 h-5" />,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/20"
          },
          {
            title: "Badges Earned",
            value: userProfile.badges,
            icon: <Award className="w-5 h-5" />,
            color: "text-purple-600", 
            bgColor: "bg-purple-100 dark:bg-purple-900/20"
          },
          {
            title: "Platforms",
            value: userProfile.verifiedPlatforms.length,
            icon: <Globe className="w-5 h-5" />,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/20"
          }
        ].map((stat, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Reputation Breakdown */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Reputation Breakdown</CardTitle>
              <CardDescription>
                Your scores across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(userProfile.reputation).map(([category, score]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium">{category}</span>
                    <Badge variant="secondary">{score}</Badge>
                  </div>
                  <Progress value={(score / 1000) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <ReputationGraph />
        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your reputation and sync across chains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={handleRefreshScores}
                disabled={isRefreshing}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Scores'}
              </Button>
              
              <Button 
                onClick={handleSyncChains}
                disabled={isSyncing}
                variant="outline"
                className="w-full"
              >
                <Globe className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-pulse' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Chains'}
              </Button>
              
              <Button 
                onClick={handleMintSoulbound}
                variant="outline"
                className="w-full"
              >
                <Award className="w-4 h-4 mr-2" />
                Mint Soulbound NFT
              </Button>
            </div>
            
            <Separator className="my-4" />
            
            <Button 
              onClick={() => router.push('/verify')}
              variant="default"
              className="w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              Verify More Platforms
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges */}
      <motion.div variants={fadeInUp}>
        <BadgeGrid address={address!} />
      </motion.div>
    </motion.div>
  );
}