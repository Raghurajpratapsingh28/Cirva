import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getStoredDevScore } from '@/lib/contracts/devScore';
import { getStoredSocialScore } from '@/lib/contracts/socialScore';
import { getStoredCommunityScore } from '@/lib/contracts/communityScore';
import { getStoredDefiScore } from '@/lib/contracts/defiScore';

const prisma = new PrismaClient();

// Badge logic based on scores and ratings
function calculateBadges(scores: { dev: number; social: number; community: number; defi: number; overall: number }, ratings: { dev: number; social: number; community: number; defi: number; overall: number }, verifiedPlatforms: string[]) {
  const badges = {
    // Platform verification badges
    platform: {
      github: verifiedPlatforms.includes('GitHub') ? 'Verified GitHub Developer' : null,
      twitter: verifiedPlatforms.includes('Twitter') ? 'Social Media Influencer' : null,
      discord: verifiedPlatforms.includes('Discord') ? 'Community Builder' : null,
    },
    
    // Score-based badges
    score: {
      dev: scores.dev >= 900 ? 'Elite Developer' : 
           scores.dev >= 800 ? 'Senior Developer' : 
           scores.dev >= 700 ? 'Mid-Level Developer' : 
           scores.dev >= 600 ? 'Junior Developer' : 
           scores.dev >= 500 ? 'Code Enthusiast' : null,
      
      social: scores.social >= 900 ? 'Social Media Legend' : 
              scores.social >= 800 ? 'Influencer' : 
              scores.social >= 700 ? 'Social Butterfly' : 
              scores.social >= 600 ? 'Active User' : 
              scores.social >= 500 ? 'Social Newcomer' : null,
      
      community: scores.community >= 900 ? 'Community Leader' : 
                 scores.community >= 800 ? 'Community Champion' : 
                 scores.community >= 700 ? 'Active Member' : 
                 scores.community >= 600 ? 'Community Helper' : 
                 scores.community >= 500 ? 'Community Newcomer' : null,
      
      defi: scores.defi >= 900 ? 'DeFi Master' : 
            scores.defi >= 800 ? 'DeFi Expert' : 
            scores.defi >= 700 ? 'DeFi Enthusiast' : 
            scores.defi >= 600 ? 'DeFi User' : 
            scores.defi >= 500 ? 'DeFi Explorer' : null,
      
      overall: scores.overall >= 900 ? 'Web3 Legend' : 
               scores.overall >= 800 ? 'Web3 Master' : 
               scores.overall >= 700 ? 'Web3 Expert' : 
               scores.overall >= 600 ? 'Web3 Enthusiast' : 
               scores.overall >= 500 ? 'Web3 Newcomer' : null,
    },
    
    // Rating-based badges
    rating: {
      dev: ratings.dev >= 5 ? '5-Star Developer' : 
           ratings.dev >= 4 ? '4-Star Developer' : 
           ratings.dev >= 3 ? '3-Star Developer' : 
           ratings.dev >= 2 ? '2-Star Developer' : 
           ratings.dev >= 1 ? '1-Star Developer' : null,
      
      social: ratings.social >= 5 ? '5-Star Social' : 
              ratings.social >= 4 ? '4-Star Social' : 
              ratings.social >= 3 ? '3-Star Social' : 
              ratings.social >= 2 ? '2-Star Social' : 
              ratings.social >= 1 ? '1-Star Social' : null,
      
      community: ratings.community >= 5 ? '5-Star Community' : 
                 ratings.community >= 4 ? '4-Star Community' : 
                 ratings.community >= 3 ? '3-Star Community' : 
                 ratings.community >= 2 ? '2-Star Community' : 
                 ratings.community >= 1 ? '1-Star Community' : null,
      
      defi: ratings.defi >= 5 ? '5-Star DeFi' : 
            ratings.defi >= 4 ? '4-Star DeFi' : 
            ratings.defi >= 3 ? '3-Star DeFi' : 
            ratings.defi >= 2 ? '2-Star DeFi' : 
            ratings.defi >= 1 ? '1-Star DeFi' : null,
      
      overall: ratings.overall >= 5 ? '5-Star Overall' : 
               ratings.overall >= 4 ? '4-Star Overall' : 
               ratings.overall >= 3 ? '3-Star Overall' : 
               ratings.overall >= 2 ? '2-Star Overall' : 
               ratings.overall >= 1 ? '1-Star Overall' : null,
    },
    
    // Special achievement badges
    achievement: {
      allPlatforms: verifiedPlatforms.length >= 3 ? 'Triple Platform Verified' : null,
      highScores: Object.values(scores).filter((score: number) => score >= 800).length >= 3 ? 'High Achiever' : null,
      perfectScore: Object.values(scores).some((score: number) => score >= 950) ? 'Perfectionist' : null,
      earlyAdopter: verifiedPlatforms.length >= 2 ? 'Early Adopter' : null,
      consistent: Object.values(scores).every((score: number) => score >= 600) ? 'Consistent Performer' : null,
    }
  };

  // Count total badges
  const totalBadges = Object.values(badges.platform).filter(Boolean).length +
                     Object.values(badges.score).filter(Boolean).length +
                     Object.values(badges.rating).filter(Boolean).length +
                     Object.values(badges.achievement).filter(Boolean).length;

  return {
    badges,
    totalBadges,
    breakdown: {
      platform: Object.values(badges.platform).filter(Boolean).length,
      score: Object.values(badges.score).filter(Boolean).length,
      rating: Object.values(badges.rating).filter(Boolean).length,
      achievement: Object.values(badges.achievement).filter(Boolean).length,
    }
  };
}

export async function GET(request: NextRequest) {
  const publicKey = request.nextUrl.searchParams.get('publicKey');
  if (!publicKey) {
    return NextResponse.json({ error: 'Missing publicKey' }, { status: 400 });
  }

  try {
    // Get complete user data from database including all ratings
    const user = await prisma.user.findUnique({
      where: { publicKey },
      select: {
        id: true,
        publicKey: true,
        githubUsername: true,
        isVerifiedGithub: true,
        twitterUsername: true,
        isVerifiedTwitter: true,
        discordUsername: true,
        isVerifiedDiscord: true,
        discordId: true,
        discordEmail: true,
        discordAvatar: true,
        discordProfileUrl: true,
        discordVerified: true,
        discordDiscriminator: true,
        discordGuildCount: true,
        discordPremiumType: true,
        discordMfaEnabled: true,
        devScore: true,
        socialScore: true,
        communityScore: true,
        defiScore: true,
        reputationScore: true,
        devRating: true,
        communityRating: true,
        socialRating: true,
        defiRating: true,
        overallRating: true,
        createdAt: true,
        updatedAt: true,
        guilds: {
          select: {
            id: true,
            guildId: true,
            discordUserId: true,
            createdAt: true,
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch blockchain scores for verified platforms
    const blockchainData = {
      devScore: null as bigint | null,
      socialScore: null as bigint | null,
      communityScore: null as bigint | null,
      defiScore: null as bigint | null,
      errors: [] as string[]
    };

    // Fetch dev score from blockchain if GitHub is verified
    if (user.isVerifiedGithub && user.githubUsername) {
      try {
        blockchainData.devScore = await getStoredDevScore(publicKey as `0x${string}`);
      } catch (error) {
        console.error('Error fetching dev score from blockchain:', error);
        blockchainData.errors.push('Failed to fetch dev score from blockchain');
      }
    }

    // Fetch social score from blockchain if Twitter is verified
    if (user.isVerifiedTwitter && user.twitterUsername) {
      try {
        blockchainData.socialScore = await getStoredSocialScore(publicKey as `0x${string}`);
      } catch (error) {
        console.error('Error fetching social score from blockchain:', error);
        blockchainData.errors.push('Failed to fetch social score from blockchain');
      }
    }

    // Fetch community score from blockchain if Discord is verified
    if (user.isVerifiedDiscord && user.discordUsername) {
      try {
        blockchainData.communityScore = await getStoredCommunityScore(publicKey as `0x${string}`);
      } catch (error) {
        console.error('Error fetching community score from blockchain:', error);
        blockchainData.errors.push('Failed to fetch community score from blockchain');
      }
    }

    // Fetch defi score from blockchain
    try {
      blockchainData.defiScore = await getStoredDefiScore(publicKey as `0x${string}`);
    } catch (error) {
      console.error('Error fetching defi score from blockchain:', error);
      blockchainData.errors.push('Failed to fetch defi score from blockchain');
    }

    // Calculate overall score and prepare reputation data
    const scores = {
      dev: user.devScore || 0,
      social: user.socialScore || 0,
      community: user.communityScore || 0,
      defi: user.defiScore || 0,
    };

    // Use reputationScore from database instead of calculating overall score
    const reputationScore = user.reputationScore || 0;

    // Prepare ratings data
    const ratings = {
      dev: user.devRating || 0,
      social: user.socialRating || 0,
      community: user.communityRating || 0,
      defi: user.defiRating || 0,
      overall: user.overallRating || 0,
    };

    // Count verified platforms
    const verifiedPlatforms = [
      user.isVerifiedGithub && 'GitHub',
      user.isVerifiedTwitter && 'Twitter',
      user.isVerifiedDiscord && 'Discord'
    ].filter(Boolean) as string[];

    // Calculate badges based on scores, ratings, and verified platforms
    const badgeData = calculateBadges(
      { ...scores, overall: reputationScore }, 
      ratings, 
      verifiedPlatforms
    );

    // Prepare reputation breakdown using reputationScore from backend
    const reputation = {
      overall: reputationScore,
      developer: scores.dev,
      contributor: scores.community,
      social: scores.social,
      defi: scores.defi
    };

    // Prepare blockchain scores for comparison
    const blockchainScores = {
      dev: blockchainData.devScore ? Number(blockchainData.devScore) : null,
      social: blockchainData.socialScore ? Number(blockchainData.socialScore) : null,
      community: blockchainData.communityScore ? Number(blockchainData.communityScore) : null,
      defi: blockchainData.defiScore ? Number(blockchainData.defiScore) : null,
    };

    // Check if blockchain scores are out of sync
    const syncStatus = {
      dev: blockchainScores.dev !== null && blockchainScores.dev !== scores.dev,
      social: blockchainScores.social !== null && blockchainScores.social !== scores.social,
      community: blockchainScores.community !== null && blockchainScores.community !== scores.community,
      defi: blockchainScores.defi !== null && blockchainScores.defi !== scores.defi,
    };

    const needsSync = Object.values(syncStatus).some(status => status);

    return NextResponse.json({
      user: {
        publicKey: user.publicKey,
        githubUsername: user.githubUsername,
        twitterUsername: user.twitterUsername,
        discordUsername: user.discordUsername,
        isVerifiedGithub: user.isVerifiedGithub,
        isVerifiedTwitter: user.isVerifiedTwitter,
        isVerifiedDiscord: user.isVerifiedDiscord,
        discordData: {
          id: user.discordId,
          email: user.discordEmail,
          avatar: user.discordAvatar,
          profileUrl: user.discordProfileUrl,
          verified: user.discordVerified,
          discriminator: user.discordDiscriminator,
          guildCount: user.discordGuildCount,
          premiumType: user.discordPremiumType,
          mfaEnabled: user.discordMfaEnabled,
        },
        guilds: user.guilds,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      scores: {
        database: scores,
        blockchain: blockchainScores,
        overall: reputationScore,
      },
      ratings: {
        dev: ratings.dev,
        social: ratings.social,
        community: ratings.community,
        defi: ratings.defi,
        overall: ratings.overall,
      },
      reputation,
      verifiedPlatforms,
      badges: badgeData,
      syncStatus: {
        needsSync,
        details: syncStatus,
        errors: blockchainData.errors,
      },
      lastUpdated: user.updatedAt,
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 