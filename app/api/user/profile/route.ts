import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const publicKey = request.nextUrl.searchParams.get('publicKey');
  if (!publicKey) {
    return NextResponse.json({ error: 'Missing publicKey' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { publicKey },
      select: {
        publicKey: true,
        githubUsername: true,
        isVerifiedGithub: true,
        twitterUsername: true,
        isVerifiedTwitter: true,
        discordUsername: true,
        isVerifiedDiscord: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('User profile fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 