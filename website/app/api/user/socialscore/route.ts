import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getStoredSocialScore } from '@/lib/contracts/socialScore';

const prisma = new PrismaClient();

// GET endpoint to fetch social score for a user
export async function GET(request: NextRequest) {
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
        socialScore: true,
        twitterUsername: true,
        isVerifiedTwitter: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user has a Twitter account verified, try to get the latest score from blockchain
    let blockchainScore: bigint | null = null;
    let blockchainError: string | null = null;

    if (user.isVerifiedTwitter && user.twitterUsername) {
      try {
        blockchainScore = await getStoredSocialScore(publicKey as `0x${string}`);
      } catch (error) {
        console.error('Error fetching blockchain score:', error);
        blockchainError = 'Failed to fetch score from blockchain';
      }
    }

    return NextResponse.json({
      user: {
        publicKey: user.publicKey,
        socialScore: user.socialScore,
        twitterUsername: user.twitterUsername,
        isVerifiedTwitter: user.isVerifiedTwitter,
        lastUpdated: user.updatedAt,
      },
      blockchain: {
        score: blockchainScore ? blockchainScore.toString() : null,
        error: blockchainError,
      },
    });
  } catch (error) {
    console.error('Social score fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST endpoint to update social score for a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicKey, socialScore, source = 'manual' } = body;

    if (!publicKey) {
      return NextResponse.json({ error: 'Missing publicKey' }, { status: 400 });
    }

    if (socialScore === undefined || socialScore === null) {
      return NextResponse.json({ error: 'Missing socialScore' }, { status: 400 });
    }

    // Validate socialScore is a number between 0 and 1000
    const scoreNumber = parseInt(socialScore);
    if (isNaN(scoreNumber) || scoreNumber < 0 || scoreNumber > 1000) {
      return NextResponse.json({ 
        error: 'Social score must be a number between 0 and 1000' 
      }, { status: 400 });
    }

    // Update user's social score in database
    const updatedUser = await prisma.user.update({
      where: { publicKey },
      data: {
        socialScore: scoreNumber,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        publicKey: true,
        socialScore: true,
        twitterUsername: true,
        isVerifiedTwitter: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Social score updated successfully',
      user: {
        publicKey: updatedUser.publicKey,
        socialScore: updatedUser.socialScore,
        twitterUsername: updatedUser.twitterUsername,
        isVerifiedTwitter: updatedUser.isVerifiedTwitter,
        lastUpdated: updatedUser.updatedAt,
      },
      source,
    });
  } catch (error) {
    console.error('Social score update error:', error);
    
    // Check if it's a "not found" error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT endpoint to sync social score from blockchain
export async function PUT(request: NextRequest) {
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
        socialScore: true,
        twitterUsername: true,
        isVerifiedTwitter: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isVerifiedTwitter || !user.twitterUsername) {
      return NextResponse.json({ 
        error: 'User must have a verified Twitter account to sync from blockchain' 
      }, { status: 400 });
    }

    // Fetch score from blockchain
    let blockchainScore: bigint;
    try {
      blockchainScore = await getStoredSocialScore(publicKey as `0x${string}`);
    } catch (error) {
      console.error('Error fetching blockchain score:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch score from blockchain' 
      }, { status: 500 });
    }

    // Convert bigint to number (assuming score is within safe range)
    const scoreNumber = Number(blockchainScore);

    // Update user's social score in database
    const updatedUser = await prisma.user.update({
      where: { publicKey },
      data: {
        socialScore: scoreNumber,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        publicKey: true,
        socialScore: true,
        twitterUsername: true,
        isVerifiedTwitter: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Social score synced from blockchain successfully',
      user: {
        publicKey: updatedUser.publicKey,
        socialScore: updatedUser.socialScore,
        twitterUsername: updatedUser.twitterUsername,
        isVerifiedTwitter: updatedUser.isVerifiedTwitter,
        lastUpdated: updatedUser.updatedAt,
      },
      blockchainScore: blockchainScore.toString(),
      synced: true,
    });
  } catch (error) {
    console.error('Social score sync error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 