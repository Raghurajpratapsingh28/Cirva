import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface DashboardData {
  user: {
    publicKey: string;
    githubUsername?: string;
    twitterUsername?: string;
    discordUsername?: string;
    isVerifiedGithub: boolean;
    isVerifiedTwitter: boolean;
    isVerifiedDiscord: boolean;
    discordData: {
      id?: string;
      email?: string;
      avatar?: string;
      profileUrl?: string;
      verified?: boolean;
      discriminator?: string;
      guildCount?: number;
      premiumType?: number;
      mfaEnabled?: boolean;
    };
    guilds: Array<{
      id: number;
      guildId: string;
      discordUserId: string;
      createdAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
  scores: {
    database: {
      dev: number;
      social: number;
      community: number;
      defi: number;
    };
    blockchain: {
      dev: number | null;
      social: number | null;
      community: number | null;
      defi: number | null;
    };
    overall: number;
  };
  ratings: {
    dev: number;
    social: number;
    community: number;
    defi: number;
    overall: number;
  };
  reputation: {
    overall: number;
    developer: number;
    contributor: number;
    social: number;
    defi: number;
  };
  verifiedPlatforms: string[];
  badges: {
    badges: {
      platform: {
        github: string | null;
        twitter: string | null;
        discord: string | null;
      };
      score: {
        dev: string | null;
        social: string | null;
        community: string | null;
        defi: string | null;
        overall: string | null;
      };
      rating: {
        dev: string | null;
        social: string | null;
        community: string | null;
        defi: string | null;
        overall: string | null;
      };
      achievement: {
        allPlatforms: string | null;
        highScores: string | null;
        perfectScore: string | null;
        earlyAdopter: string | null;
        consistent: string | null;
      };
    };
    totalBadges: number;
    breakdown: {
      platform: number;
      score: number;
      rating: number;
      achievement: number;
    };
  };
  syncStatus: {
    needsSync: boolean;
    details: {
      dev: boolean;
      social: boolean;
      community: boolean;
      defi: boolean;
    };
    errors: string[];
  };
  lastUpdated: string;
}

export function useDashboardData() {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!address || !isConnected) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/dashboard?publicKey=${address}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [address, isConnected]);

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    data,
    loading,
    error,
    refreshData,
  };
} 