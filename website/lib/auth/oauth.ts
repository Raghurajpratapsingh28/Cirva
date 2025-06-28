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

// In-memory storage for OAuth state and code verifiers
// In production, you should use a proper database or Redis
const oauthStorage = new Map<string, { state: string; codeVerifier?: string; timestamp: number }>();

class OAuthManager {
  private configs: Record<string, OAuthConfig> = {
    github: {
      clientId: (process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '').trim(),
      clientSecret: (process.env.GITHUB_CLIENT_SECRET || '').trim(),
      redirectUri: `${(process.env.NEXT_PUBLIC_APP_URL || '').trim()}/api/auth/github/callback`,
      scope: 'read:user user:email',
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
    },
    discord: {
      clientId: (process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '').trim(),
      clientSecret: (process.env.DISCORD_CLIENT_SECRET || '').trim(),
      redirectUri: `${(process.env.NEXT_PUBLIC_APP_URL || '').trim()}/api/auth/discord/callback`,
      scope: 'identify email guilds',
      authUrl: 'https://discord.com/api/oauth2/authorize',
      tokenUrl: 'https://discord.com/api/oauth2/token',
    },
    twitter: {
      clientId: (process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '').trim(),
      clientSecret: (process.env.TWITTER_CLIENT_SECRET || '').trim(),
      redirectUri: `${(process.env.NEXT_PUBLIC_APP_URL || '').trim()}/api/auth/twitter/callback`,
      scope: 'tweet.read users.read offline.access',
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    },
  };

  constructor() {
  }

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

    // Validate redirect URI
    if (!config.redirectUri || config.redirectUri.includes('+++')) {
      console.error('Invalid redirect URI detected:', config.redirectUri);
      throw new Error(`Invalid redirect URI for ${platform}: ${config.redirectUri}`);
    }

    // Manually construct the URL to avoid encoding issues
    const baseUrl = config.authUrl;
    const params = [
      `client_id=${encodeURIComponent(config.clientId)}`,
      `redirect_uri=${encodeURIComponent(config.redirectUri)}`,
      `scope=${encodeURIComponent(config.scope)}`,
      `state=${encodeURIComponent(state)}`,
      `response_type=code`
    ];

    // Add PKCE for Twitter OAuth 2.0
    if (platform === 'twitter' && codeChallenge) {
      params.push(`code_challenge=${encodeURIComponent(codeChallenge)}`);
      params.push(`code_challenge_method=S256`);
    }

    const finalUrl = `${baseUrl}?${params.join('&')}`;
    
    return finalUrl;
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
      code: code,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    });

    // Add client_secret for platforms that require it (GitHub, Discord)
    // Twitter OAuth 2.0 with PKCE doesn't require client_secret in body
    if (platform !== 'twitter' && config.clientSecret) {
      body.append('client_secret', config.clientSecret);
    }

    // Add PKCE verifier for Twitter
    if (platform === 'twitter' && codeVerifier) {
      body.append('code_verifier', codeVerifier);
    } else if (platform === 'twitter' && !codeVerifier) {
      console.error('Twitter OAuth requires code_verifier but none provided!');
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    };

    // Add Authorization header for Twitter OAuth 2.0 with PKCE
    if (platform === 'twitter' && config.clientSecret) {
      const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: headers,
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token exchange failed for ${platform}:`, response.status, errorText);
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Store OAuth state and code verifier
  storeOAuthState(platform: string, state: string, codeVerifier?: string): void {
    // Extract the actual state from the combined state string
    // State format: "publicKey:${address}|${randomState}" or just "${randomState}"
    // For Twitter: "publicKey:${address}|${randomState}|${codeVerifier}" or "${randomState}|${codeVerifier}"
    let actualState = state;

    if (platform === 'twitter') {
      // For Twitter, extract the random state part (before the code verifier)
      const parts = state.split('|');
      if (parts.length >= 3) {
        // Format: publicKey:address|randomState|codeVerifier
        actualState = parts[1];
      } else if (parts.length >= 2) {
        // Format: randomState|codeVerifier
        actualState = parts[0];
      }
    } else {
      // For other platforms, extract state normally
      if (state.includes('publicKey:')) {
        const parts = state.split('|');
        if (parts.length >= 2) {
          actualState = parts[1];
        }
      }
    }

    // Try to use sessionStorage if available (client-side)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(`oauth_state_${platform}`, state);
      if (codeVerifier) {
        sessionStorage.setItem(`oauth_verifier_${platform}`, codeVerifier);
      }
    } else {
      // Server-side storage
      const key = `${platform}_${actualState}`;
      oauthStorage.set(key, { state, codeVerifier, timestamp: Date.now() });
      
      // Clean up old entries (older than 10 minutes)
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      for (const [k, v] of oauthStorage.entries()) {
        if (v.timestamp < tenMinutesAgo) {
          oauthStorage.delete(k);
        }
      }
    }
  }

  // Retrieve and validate OAuth state
  validateOAuthState(platform: string, state: string): boolean {
    // Extract the actual state from the combined state string
    // State format: "publicKey:${address}|${randomState}" or just "${randomState}"
    // For Twitter: "publicKey:${address}|${randomState}|${codeVerifier}" or "${randomState}|${codeVerifier}"
    let actualState = state;

    if (platform === 'twitter') {
      // For Twitter, extract the random state part (before the code verifier)
      const parts = state.split('|');
      if (parts.length >= 3) {
        // Format: publicKey:address|randomState|codeVerifier
        actualState = parts[1];
      } else if (parts.length >= 2) {
        // Format: randomState|codeVerifier
        actualState = parts[0];
      }
    } else {
      // For other platforms, extract state normally
      if (state.includes('publicKey:')) {
        const parts = state.split('|');
        if (parts.length >= 2) {
          actualState = parts[1];
        }
      }
    }

    // Try to use sessionStorage if available (client-side)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storedState = sessionStorage.getItem(`oauth_state_${platform}`);
      sessionStorage.removeItem(`oauth_state_${platform}`);
      return storedState === state;
    } else {
      // Server-side validation
      const key = `${platform}_${actualState}`;
      const stored = oauthStorage.get(key);
      if (stored && stored.state === state) {
        oauthStorage.delete(key);
        return true;
      }
      return false;
    }
  }

  getCodeVerifier(platform: string, state: string): string | null {
    // Extract the actual state from the combined state string
    // State format: "publicKey:${address}|${randomState}" or just "${randomState}"
    // For Twitter: "publicKey:${address}|${randomState}|${codeVerifier}" or "${randomState}|${codeVerifier}"
    let actualState = state;
    let codeVerifier: string | null = null;

    if (platform === 'twitter') {
      // For Twitter, the state includes the code verifier
      const parts = state.split('|');
      if (parts.length >= 3) {
        // Format: publicKey:address|randomState|codeVerifier
        actualState = parts[1];
        codeVerifier = parts[2];
      } else if (parts.length >= 2) {
        // Format: randomState|codeVerifier
        actualState = parts[0];
        codeVerifier = parts[1];
      }
    } else {
      // For other platforms, extract state normally
      if (state.includes('publicKey:')) {
        const parts = state.split('|');
        if (parts.length >= 2) {
          actualState = parts[1];
        }
      }
    }

    // For Twitter, return the code verifier from state
    if (platform === 'twitter' && codeVerifier) {
      return codeVerifier;
    }

    // Try to use sessionStorage if available (client-side)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const verifier = sessionStorage.getItem(`oauth_verifier_${platform}`);  
      sessionStorage.removeItem(`oauth_verifier_${platform}`);
      return verifier;
    } else {
      // Server-side retrieval
      const key = `${platform}_${actualState}`;
      const stored = oauthStorage.get(key);
      if (stored && stored.codeVerifier) {
        return stored.codeVerifier;
      }
      return null;
    }
  }
}

export const oauthManager = new OAuthManager();