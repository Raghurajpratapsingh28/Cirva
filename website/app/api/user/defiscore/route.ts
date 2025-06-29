import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getStoredDefiScore } from '@/lib/contracts/defiScore';

const prisma = new PrismaClient();

// GET endpoint to fetch defi score for a user
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
        defiScore: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Try to get the latest score from blockchain
    let blockchainScore: bigint | null = null;
    let blockchainError: string | null = null;
    try {
      blockchainScore = await getStoredDefiScore(publicKey as `0x${string}`);
    } catch (error) {
      console.error('Error fetching blockchain defi score:', error);
      blockchainError = 'Failed to fetch score from blockchain';
    }

    return NextResponse.json({
      user: {
        publicKey: user.publicKey,
        defiScore: user.defiScore,
        lastUpdated: user.updatedAt,
      },
      blockchain: {
        score: blockchainScore ? blockchainScore.toString() : null,
        error: blockchainError,
      },
    });
  } catch (error) {
    console.error('Defi score fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST endpoint to update defi score for a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicKey, defiScore, source = 'manual' } = body;

    if (!publicKey) {
      return NextResponse.json({ error: 'Missing publicKey' }, { status: 400 });
    }

    if (defiScore === undefined || defiScore === null) {
      return NextResponse.json({ error: 'Missing defiScore' }, { status: 400 });
    }

    // Validate defiScore is a number between 0 and 300
    const scoreNumber = parseInt(defiScore);
    if (isNaN(scoreNumber) || scoreNumber < 0 || scoreNumber > 300) {
      return NextResponse.json({ 
        error: 'DeFi score must be a number between 0 and 300' 
      }, { status: 400 });
    }

    // Update user's defi score in database
    const updatedUser = await prisma.user.update({
      where: { publicKey },
      data: {
        defiScore: scoreNumber,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        publicKey: true,
        defiScore: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'DeFi score updated successfully',
      user: {
        publicKey: updatedUser.publicKey,
        defiScore: updatedUser.defiScore,
        lastUpdated: updatedUser.updatedAt,
      },
      source,
    });
  } catch (error) {
    console.error('DeFi score update error:', error);
    // Check if it's a "not found" error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT endpoint to sync defi score from blockchain
export async function PUT(request: NextRequest) {
  const body = await request.json();

  const { publicKey, score } = body;

  if (!publicKey) {
    return NextResponse.json({ error: 'Missing publicKey' }, { status: 400 });
  }

  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { publicKey },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user's defi score in database
    const updatedUser = await prisma.user.update({
      where: { publicKey },
      data: {
        defiScore: score,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'DeFi score synced from blockchain successfully',
      user: {
        publicKey: updatedUser.publicKey,
        defiScore: updatedUser.defiScore,
        lastUpdated: updatedUser.updatedAt,
      },
      synced: true,
    });
  } catch (error) {
    console.error('DeFi score sync error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 