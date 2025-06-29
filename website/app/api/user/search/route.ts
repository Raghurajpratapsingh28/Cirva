import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const publicKey = request.nextUrl.searchParams.get('publicKey');
  if (!publicKey) {
    return NextResponse.json({ error: 'Missing publicKey' }, { status: 400 });
  }

  try {
    console.log('Searching for user with publicKey:', publicKey);
    
    // Get basic user data from database
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
      },
    });

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate overall score
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

    // Prepare reputation breakdown
    const reputation = {
      overall: reputationScore,
      developer: scores.dev,
      contributor: scores.community,
      social: scores.social,
      defi: scores.defi
    };

    // Simple badge calculation
    const badges = {
      badges: {
        platform: {
          github: user.isVerifiedGithub ? 'Verified GitHub Developer' : null,
          twitter: user.isVerifiedTwitter ? 'Social Media Influencer' : null,
          discord: user.isVerifiedDiscord ? 'Community Builder' : null,
        },
        score: {
          dev: scores.dev >= 800 ? 'Senior Developer' : scores.dev >= 600 ? 'Developer' : null,
          social: scores.social >= 800 ? 'Influencer' : scores.social >= 600 ? 'Social User' : null,
          community: scores.community >= 800 ? 'Community Champion' : scores.community >= 600 ? 'Community Member' : null,
          defi: scores.defi >= 800 ? 'DeFi Expert' : scores.defi >= 600 ? 'DeFi User' : null,
          overall: reputationScore >= 800 ? 'Web3 Master' : reputationScore >= 600 ? 'Web3 Enthusiast' : null,
        },
        rating: {
          dev: ratings.dev >= 4 ? '4-Star Developer' : ratings.dev >= 3 ? '3-Star Developer' : null,
          social: ratings.social >= 4 ? '4-Star Social' : ratings.social >= 3 ? '3-Star Social' : null,
          community: ratings.community >= 4 ? '4-Star Community' : ratings.community >= 3 ? '3-Star Community' : null,
          defi: ratings.defi >= 4 ? '4-Star DeFi' : ratings.defi >= 3 ? '3-Star DeFi' : null,
          overall: ratings.overall >= 4 ? '4-Star Overall' : ratings.overall >= 3 ? '3-Star Overall' : null,
        },
        achievement: {
          allPlatforms: verifiedPlatforms.length >= 3 ? 'Triple Platform Verified' : null,
          highScores: Object.values(scores).filter(score => score >= 800).length >= 2 ? 'High Achiever' : null,
          earlyAdopter: verifiedPlatforms.length >= 2 ? 'Early Adopter' : null,
        }
      },
      totalBadges: 0, // Will calculate below
      breakdown: {
        platform: 0,
        score: 0,
        rating: 0,
        achievement: 0,
      }
    };

    // Calculate badge counts
    badges.totalBadges = Object.values(badges.badges.platform).filter(Boolean).length +
                        Object.values(badges.badges.score).filter(Boolean).length +
                        Object.values(badges.badges.rating).filter(Boolean).length +
                        Object.values(badges.badges.achievement).filter(Boolean).length;

    badges.breakdown = {
      platform: Object.values(badges.badges.platform).filter(Boolean).length,
      score: Object.values(badges.badges.score).filter(Boolean).length,
      rating: Object.values(badges.badges.rating).filter(Boolean).length,
      achievement: Object.values(badges.badges.achievement).filter(Boolean).length,
    };

    const response = {
      user: {
        publicKey: user.publicKey,
        githubUsername: user.githubUsername,
        twitterUsername: user.twitterUsername,
        discordUsername: user.discordUsername,
        isVerifiedGithub: user.isVerifiedGithub,
        isVerifiedTwitter: user.isVerifiedTwitter,
        isVerifiedDiscord: user.isVerifiedDiscord,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      scores: {
        database: scores,
        blockchain: {
          dev: null,
          social: null,
          community: null,
          defi: null,
        },
        overall: reputationScore,
      },
      ratings,
      reputation,
      verifiedPlatforms,
      badges,
      syncStatus: {
        needsSync: false,
        details: {
          dev: false,
          social: false,
          community: false,
          defi: false,
        },
        errors: [],
      },
      lastUpdated: user.updatedAt,
    };

    console.log('Returning response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 