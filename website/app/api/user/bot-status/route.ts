import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const publicKey = searchParams.get('publicKey');

  if (!publicKey) {
    return NextResponse.json({ error: 'Missing publicKey parameter' }, { status: 400 });
  }

  try {
    // Find the user by public key
    const user = await prisma.user.findUnique({
      where: { publicKey },
      include: {
        guilds: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has any guilds (bot is invited to servers)
    const hasBotInvited = user.guilds.length > 0;
    const guildCount = user.guilds.length;

    return NextResponse.json({
      hasBotInvited,
      guildCount,
      guilds: user.guilds.map(guild => ({
        guildId: guild.guildId,
        invitedAt: guild.createdAt
      }))
    });

  } catch (error) {
    console.error('Error checking bot status:', error);
    return NextResponse.json({ 
      error: 'Failed to check bot status',
      details: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
} 