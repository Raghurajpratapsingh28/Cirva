'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { ProfileCard } from '@/components/ProfileCard';
import { ReputationGraph } from '@/components/ReputationGraph';
import { BadgeGrid } from '@/components/BadgeGrid';
import { SyncStatusBadge } from '@/components/SyncStatusBadge';
import { DevScoreButton } from '@/components/DevScoreButton';
import { SocialScoreButton } from '@/components/SocialScoreButton';
import { CommunityScoreButton } from '@/components/CommunityScoreButton';
import { CCIPDemo } from '@/components/CCIPDemo';
import { DefiScoreButton } from '@/components/DefiScoreButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  Zap, 
  Award, 
  TrendingUp,
  Shield,
  Globe,
  Star,
  Network,
  AlertCircle,
  Trophy,
  Medal,
  Crown,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useDashboardData } from '@/hooks/useDashboardData';

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
  const [showCCIPDemo, setShowCCIPDemo] = useState(false);

  // Use the new comprehensive dashboard data hook
  const { data: dashboardData, loading, error, refreshData } = useDashboardData();

  // Transform dashboard data to match the expected format for existing components
  const userProfile = dashboardData ? {
    reputation: dashboardData.reputation,
    badges: dashboardData.badges.totalBadges,
    verifiedPlatforms: dashboardData.verifiedPlatforms,
    lastUpdated: dashboardData.lastUpdated,
    ens: null as string | null
  } : {
    reputation: {
      overall: 0,
      developer: 0,
      contributor: 0,
      social: 0,
      defi: 0
    },
    badges: 0,
    verifiedPlatforms: [],
    lastUpdated: new Date().toISOString(),
    ens: null as string | null
  };

  const handleRefreshScores = async () => {
    setIsRefreshing(true);
    try {
      // Refresh data from the API
      await refreshData();
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
      // Call the sync API to sync scores from blockchain
      const response = await fetch(`/api/user/sync?publicKey=${address}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync scores');
      }

      const syncResult = await response.json();
      
      // Refresh dashboard data after sync
      await refreshData();
      
      toast.success('Profile synced across all chains!');
    } catch (error) {
      console.error('Sync error:', error);
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

  if (showCCIPDemo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">CCIP Cross-Chain Demo</h1>
          <Button variant="outline" onClick={() => setShowCCIPDemo(false)}>
            Back to Dashboard
          </Button>
        </div>
        <CCIPDemo />
      </div>
    );
  }

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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <Skeleton className="h-64 w-full" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">Error Loading Dashboard</h1>
          <p className="text-muted-foreground max-w-md">
            {error}
          </p>
        </div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
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

      {/* Sync Status Alert */}
      {dashboardData?.syncStatus.needsSync && (
        <motion.div variants={fadeInUp}>
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Blockchain scores are out of sync
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-300">
                    Some scores on the blockchain differ from your local scores. Consider syncing.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleSyncChains}>
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* CCIP Demo Card */}
      <motion.div variants={fadeInUp}>
        <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">🚀 CCIP Cross-Chain Demo</h3>
                <p className="text-sm text-muted-foreground">
                  Test the cross-chain reputation synchronization functionality
                </p>
              </div>
              <Button onClick={() => setShowCCIPDemo(true)}>
                Try CCIP Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Overview */}
      <motion.div variants={fadeInUp}>
        <ProfileCard address={address!} profile={userProfile} />
      </motion.div>

      {/* Enhanced Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={staggerContainer}
      >
        {[
          {
            title: "Overall Score",
            value: userProfile.reputation.overall,
            subtitle: `Rating: ${dashboardData?.ratings.overall || 0}/5`,
            icon: <Star className="w-5 h-5" />,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
          },
          {
            title: "Developer Score", 
            value: userProfile.reputation.developer,
            subtitle: `Rating: ${dashboardData?.ratings.dev || 0}/5`,
            icon: <TrendingUp className="w-5 h-5" />,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/20"
          },
          {
            title: "Badges Earned",
            value: dashboardData?.badges.totalBadges || 0,
            subtitle: `${dashboardData?.badges.breakdown.platform || 0} platform, ${dashboardData?.badges.breakdown.score || 0} score, ${dashboardData?.badges.breakdown.rating || 0} rating`,
            icon: <Award className="w-5 h-5" />,
            color: "text-purple-600", 
            bgColor: "bg-purple-100 dark:bg-purple-900/20"
          },
          {
            title: "Platforms",
            value: userProfile.verifiedPlatforms.length,
            subtitle: `${dashboardData?.verifiedPlatforms.join(', ') || 'None verified'}`,
            icon: <Globe className="w-5 h-5" />,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/20"
          }
        ].map((stat, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
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

      {/* Ratings and Scores Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={staggerContainer}
      >
        {/* Reputation Breakdown */}
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
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{score}</Badge>
                      {dashboardData?.ratings && (
                        <Badge variant="outline">
                          {dashboardData.ratings[category as keyof typeof dashboardData.ratings] || 0}/5
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress value={(score / 1000) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Ratings Overview */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Ratings Overview</CardTitle>
              <CardDescription>
                Your star ratings across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {dashboardData?.ratings && Object.entries(dashboardData.ratings).map(([category, rating]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium">{category}</span>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
                    </div>
                  </div>
                  <Progress value={(rating / 5) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* DevScore Integration */}
      {/* <motion.div variants={fadeInUp}>
        <DevScoreButton 
          onScoreCalculated={(score) => {
            toast.success(`Developer score calculated: ${score.toString()}`);
            // Update the mock user profile with the new score
            setUserProfile(prev => ({
              ...prev,
              reputation: {
                ...prev.reputation,
                developer: Number(score)
              }
            }));
          }}
        />
      </motion.div> */}

      {/* SocialScore Integration */}
      {/* <motion.div variants={fadeInUp}>
        <SocialScoreButton 
          onScoreCalculated={(score) => {
            toast.success(`Social score calculated: ${score.toString()}`);
            // Update the mock user profile with the new score
            setUserProfile(prev => ({
              ...prev,
              reputation: {
                ...prev.reputation,
                social: Number(score)
              }
            }));
          }}
          twitterUsername={twitterUsername}
        />
      </motion.div> */}

      {/* CommunityScore Integration */}
      {/* <motion.div variants={fadeInUp}>
        <CommunityScoreButton 
          onScoreCalculated={(score) => {
            toast.success(`Community score calculated: ${score.toString()}`);
            // Update the mock user profile with the new score
            setUserProfile(prev => ({
              ...prev,
              reputation: {
                ...prev.reputation,
                contributor: Number(score)
              }
            }));
          }}
        />
      </motion.div> */}

      {/* DefiScore Integration */}
      {/* <motion.div variants={fadeInUp}>
        <DefiScoreButton 
          onScoreCalculated={(score) => {
            toast.success(`DeFi score calculated: ${score.toString()}`);
            setUserProfile(prev => ({
              ...prev,
              reputation: {
                ...prev.reputation,
                defi: Number(score)
              }
            }));
          }}
        />
      </motion.div> */}

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

      {/* Badge Categories */}
      {dashboardData?.badges && (
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Badge Categories</span>
              </CardTitle>
              <CardDescription>
                Your achievements across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Platform Badges */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium">Platform Badges</h4>
                    <Badge variant="secondary">{dashboardData.badges.breakdown.platform}</Badge>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(dashboardData.badges.badges.platform).map(([platform, badge]) => 
                      badge && (
                        <div key={platform} className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Medal className="w-3 h-3" />
                          <span>{badge}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Score Badges */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium">Score Badges</h4>
                    <Badge variant="secondary">{dashboardData.badges.breakdown.score}</Badge>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(dashboardData.badges.badges.score).map(([category, badge]) => 
                      badge && (
                        <div key={category} className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Award className="w-3 h-3" />
                          <span>{badge}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Rating Badges */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <h4 className="font-medium">Rating Badges</h4>
                    <Badge variant="secondary">{dashboardData.badges.breakdown.rating}</Badge>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(dashboardData.badges.badges.rating).map(([category, badge]) => 
                      badge && (
                        <div key={category} className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Crown className="w-3 h-3" />
                          <span>{badge}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium">Achievements</h4>
                    <Badge variant="secondary">{dashboardData.badges.breakdown.achievement}</Badge>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(dashboardData.badges.badges.achievement).map(([achievement, badge]) => 
                      badge && (
                        <div key={achievement} className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Trophy className="w-3 h-3" />
                          <span>{badge}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reputation Graph */}
      <motion.div variants={fadeInUp}>
        <ReputationGraph />
      </motion.div>
    </motion.div>
  );
}