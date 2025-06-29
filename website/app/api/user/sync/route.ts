import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getStoredDevScore } from '@/lib/contracts/devScore';
import { getStoredSocialScore } from '@/lib/contracts/socialScore';
import { getStoredCommunityScore } from '@/lib/contracts/communityScore';
import { getStoredDefiScore } from '@/lib/contracts/defiScore';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const publicKey = request.nextUrl.searchParams.get('publicKey');
  if (!publicKey) {
    return NextResponse.json({ error: 'Missing publicKey' }, { status: 400 });
  }

  try {
    // Get user from database
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
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const syncResults = {
      dev: { synced: false, oldScore: user.devScore, newScore: null as number | null, error: null as string | null },
      social: { synced: false, oldScore: user.socialScore, newScore: null as number | null, error: null as string | null },
      community: { synced: false, oldScore: user.communityScore, newScore: null as number | null, error: null as string | null },
      defi: { synced: false, oldScore: user.defiScore, newScore: null as number | null, error: null as string | null },
    };

    // Sync dev score if GitHub is verified
    if (user.isVerifiedGithub && user.githubUsername) {
      try {
        const blockchainScore = await getStoredDevScore(publicKey as `0x${string}`);
        const scoreNumber = Number(blockchainScore);
        syncResults.dev.newScore = scoreNumber;
        syncResults.dev.synced = true;
      } catch (error) {
        console.error('Error syncing dev score:', error);
        syncResults.dev.error = 'Failed to fetch from blockchain';
      }
    }

    // Sync social score if Twitter is verified
    if (user.isVerifiedTwitter && user.twitterUsername) {
      try {
        const blockchainScore = await getStoredSocialScore(publicKey as `0x${string}`);
        const scoreNumber = Number(blockchainScore);
        syncResults.social.newScore = scoreNumber;
        syncResults.social.synced = true;
      } catch (error) {
        console.error('Error syncing social score:', error);
        syncResults.social.error = 'Failed to fetch from blockchain';
      }
    }

    // Sync community score if Discord is verified
    if (user.isVerifiedDiscord && user.discordUsername) {
      try {
        const blockchainScore = await getStoredCommunityScore(publicKey as `0x${string}`);
        const scoreNumber = Number(blockchainScore);
        syncResults.community.newScore = scoreNumber;
        syncResults.community.synced = true;
      } catch (error) {
        console.error('Error syncing community score:', error);
        syncResults.community.error = 'Failed to fetch from blockchain';
      }
    }

    // Sync defi score (always try to sync)
    try {
      const blockchainScore = await getStoredDefiScore(publicKey as `0x${string}`);
      const scoreNumber = Number(blockchainScore);
      syncResults.defi.newScore = scoreNumber;
      syncResults.defi.synced = true;
    } catch (error) {
      console.error('Error syncing defi score:', error);
      syncResults.defi.error = 'Failed to fetch from blockchain';
    }

    // Update database with new scores
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (syncResults.dev.synced && syncResults.dev.newScore !== null) {
      updateData.devScore = syncResults.dev.newScore;
    }
    if (syncResults.social.synced && syncResults.social.newScore !== null) {
      updateData.socialScore = syncResults.social.newScore;
    }
    if (syncResults.community.synced && syncResults.community.newScore !== null) {
      updateData.communityScore = syncResults.community.newScore;
    }
    if (syncResults.defi.synced && syncResults.defi.newScore !== null) {
      updateData.defiScore = syncResults.defi.newScore;
    }

    // Only update if there are new scores
    if (Object.keys(updateData).length > 1) { // More than just updatedAt
      await prisma.user.update({
        where: { publicKey },
        data: updateData,
      });
    }

    // Calculate overall score
    const scores = {
      dev: syncResults.dev.synced ? syncResults.dev.newScore! : user.devScore || 0,
      social: syncResults.social.synced ? syncResults.social.newScore! : user.socialScore || 0,
      community: syncResults.community.synced ? syncResults.community.newScore! : user.communityScore || 0,
      defi: syncResults.defi.synced ? syncResults.defi.newScore! : user.defiScore || 0,
    };

    const overallScore = Math.round((scores.dev + scores.social + scores.community + scores.defi) / 4);

    return NextResponse.json({
      success: true,
      message: 'Scores synced successfully',
      syncResults,
      scores: {
        database: scores,
        overall: overallScore,
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 