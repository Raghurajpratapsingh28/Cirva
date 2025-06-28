import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all guilds with user info
    const guilds = await prisma.guild.findMany({
      include: {
        user: {
          select: {
            id: true,
            publicKey: true,
            discordUsername: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📊 All guilds in database:', guilds.length);

    return NextResponse.json({
      totalGuilds: guilds.length,
      guilds: guilds.map(guild => ({
        guildId: guild.guildId,
        invitedAt: guild.createdAt,
        userId: guild.userId,
        userPublicKey: guild.user.publicKey,
        discordUsername: guild.user.discordUsername
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching all guilds:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch guilds',
      details: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
} 