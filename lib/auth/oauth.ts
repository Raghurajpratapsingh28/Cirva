// OAuth authentication utilities for secure platform verification

export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in?: number;
  refresh_token?: string;
}

export interface VerificationResult {
  success: boolean;
  user: any;
  error?: string;
}

class OAuthManager {
  private configs: Record<string, OAuthConfig> = {
    github: {
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
      scope: 'read:user user:email',
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
    },
    discord: {
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`,
      scope: 'identify email guilds',
      authUrl: 'https://discord.com/api/oauth2/authorize',
      tokenUrl: 'https://discord.com/api/oauth2/token',
    },
    twitter: {
      clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
      scope: 'tweet.read users.read',
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    },
  };

  generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  getAuthUrl(platform: string, state: string, codeChallenge?: string): string {
    const config = this.configs[platform];
    if (!config) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      state: state,
      response_type: 'code',
    });

    // Add PKCE for Twitter OAuth 2.0
    if (platform === 'twitter' && codeChallenge) {
      params.append('code_challenge', codeChallenge);
      params.append('code_challenge_method', 'S256');
    }

    return `${config.authUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(
    platform: string, 
    code: string, 
    codeVerifier?: string
  ): Promise<OAuthTokenResponse> {
    const config = this.configs[platform];
    if (!config) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret || '',
      code: code,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    });

    // Add PKCE verifier for Twitter
    if (platform === 'twitter' && codeVerifier) {
      body.append('code_verifier', codeVerifier);
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    return response.json();
  }

  // Store OAuth state and code verifier in session storage
  storeOAuthState(platform: string, state: string, codeVerifier?: string): void {
    sessionStorage.setItem(`oauth_state_${platform}`, state);
    if (codeVerifier) {
      sessionStorage.setItem(`oauth_verifier_${platform}`, codeVerifier);
    }
  }

  // Retrieve and validate OAuth state
  validateOAuthState(platform: string, state: string): boolean {
    const storedState = sessionStorage.getItem(`oauth_state_${platform}`);
    sessionStorage.removeItem(`oauth_state_${platform}`);
    return storedState === state;
  }

  getCodeVerifier(platform: string): string | null {
    const verifier = sessionStorage.getItem(`oauth_verifier_${platform}`);
    sessionStorage.removeItem(`oauth_verifier_${platform}`);
    return verifier;
  }
}

export const oauthManager = new OAuthManager();