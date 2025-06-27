import { NextRequest, NextResponse } from 'next/server';
import { platformAuth } from '@/lib/auth/platforms';

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
    const result = await platformAuth.verifyPlatform('twitter', code, state);
    
    if (result.success) {
      const successUrl = new URL('/verify', request.url);
      successUrl.searchParams.set('platform', 'twitter');
      successUrl.searchParams.set('success', 'true');
      successUrl.searchParams.set('username', result.user.username);
      successUrl.searchParams.set('score', platformAuth.calculateReputationScore('twitter', result.user).toString());
      
      return NextResponse.redirect(successUrl);
    } else {
      const errorUrl = new URL('/verify', request.url);
      errorUrl.searchParams.set('error', result.error || 'verification_failed');
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error('Twitter OAuth callback error:', error);
    const errorUrl = new URL('/verify', request.url);
    errorUrl.searchParams.set('error', 'server_error');
    return NextResponse.redirect(errorUrl);
  }
}