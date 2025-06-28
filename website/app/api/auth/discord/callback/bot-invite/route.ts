import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const guildId = searchParams.get('guild_id');

  if (!code || !guildId) {
    return NextResponse.json({ error: 'Missing code or guild_id' }, { status: 400 });
  }

  // Exchange code for access token
  const params = new URLSearchParams();
  params.append('client_id', process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!);
  params.append('client_secret', process.env.DISCORD_CLIENT_SECRET!);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback/bot-invite`);

  let accessToken = '';
  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
    if (!accessToken) throw new Error('No access token');
  } catch (err) {
    return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 500 });
  }

  // Fetch user info
  let userId = '';
  try {
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userRes.json();
    userId = userData.id;
    if (!userId) throw new Error('No user id');
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 500 });
  }

  // Find the user in the User table by discordId
  const user = await prisma.user.findFirst({ where: { discordId: userId } });
  if (!user) {
    return NextResponse.json({ error: 'No user found with this Discord user ID' }, { status: 404 });
  }

  // Store in Guild table
  try {
    await prisma.guild.create({
      data: {
        guildId,
        discordUserId: userId,
        userId: user.id,
      },
    });
    // Redirect or show a success message
    return NextResponse.redirect(new URL('/verify?bot_invite=success', request.url));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to store guild info', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 