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
    const result = await platformAuth.verifyPlatform('github', code, state);
    
    if (result.success) {
      // Extract publicKey from state
      const publicKey = state ? extractPublicKey(state) : null;
      if (publicKey) {
        // Update user in DB
        await prisma.user.update({
          where: { publicKey },
          data: {
            githubUsername: result.user.username,
            isVerifiedGithub: true,
          },
        });
      }
      // Store verification result in session or database
      // For demo, we'll redirect with success parameters
      const successUrl = new URL('/verify', request.url);
      successUrl.searchParams.set('platform', 'github');
      successUrl.searchParams.set('success', 'true');
      successUrl.searchParams.set('username', result.user.username);
      // Removed client-side score calculation - GetDevScore smart contract is the source of truth
      
      return NextResponse.redirect(successUrl);
    } else {
      const errorUrl = new URL('/verify', request.url);
      errorUrl.searchParams.set('error', result.error || 'verification_failed');
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    const errorUrl = new URL('/verify', request.url);
    errorUrl.searchParams.set('error', 'server_error');
    return NextResponse.redirect(errorUrl);
  }
}