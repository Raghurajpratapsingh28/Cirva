import { NextRequest, NextResponse } from 'next/server';
import { platformAuth } from '@/lib/auth/platforms';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

function extractPublicKey(state: string): string | null {
  const match = state.match(/^publicKey:([^|]+)\|/);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    const errorUrl = new URL('/verify', request.url);
    errorUrl.searchParams.set('error', error);
    return NextResponse.redirect(errorUrl);
  }

  if (!code || !state) {
    const errorUrl = new URL('/verify', request.url);
    errorUrl.searchParams.set('error', 'missing_parameters');
    return NextResponse.redirect(errorUrl);
  }

  try {
    const result = await platformAuth.verifyPlatform('discord', code, state);
    
    if (result.success) {
      // Extract publicKey from state
      const publicKey = state ? extractPublicKey(state) : null;
      if (publicKey) {
        // Update user in DB
        await prisma.user.update({
          where: { publicKey },
          data: {
            discordUsername: result.user.username,
            isVerifiedDiscord: true,
            discordId: result.user.id,
            discordEmail: result.user.email,
            discordAvatar: result.user.avatar,
            discordProfileUrl: result.user.profileUrl,
            discordVerified: result.user.verified,
            discordDiscriminator: result.user.metadata?.discriminator,
            discordGuildCount: result.user.metadata?.guilds,
            discordPremiumType: result.user.metadata?.premiumType,
            discordMfaEnabled: result.user.metadata?.mfaEnabled,
          },
        });
      }
      // Store verification result in session or database
      // For demo, we'll redirect with success parameters
      const successUrl = new URL('/verify', request.url);
      successUrl.searchParams.set('platform', 'discord');
      successUrl.searchParams.set('success', 'true');
      successUrl.searchParams.set('username', result.user.username);
      successUrl.searchParams.set('score', platformAuth.calculateReputationScore('discord', result.user).toString());
      
      return NextResponse.redirect(successUrl);
    } else {
      const errorUrl = new URL('/verify', request.url);
      errorUrl.searchParams.set('error', result.error || 'verification_failed');
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error('Discord OAuth callback error:', error);
    const errorUrl = new URL('/verify', request.url);
    errorUrl.searchParams.set('error', 'server_error');
    return NextResponse.redirect(errorUrl);
  }

}

export async function POST(request: NextRequest) {
  // For Discord OAuth, POST is not typically used for the callback route.
  // But if needed, you could handle POST requests for advanced flows (e.g., PKCE or server-to-server).
  // For now, return a 405 Method Not Allowed to indicate only GET is supported
  return NextResponse.json({ message: 'OK' });
}