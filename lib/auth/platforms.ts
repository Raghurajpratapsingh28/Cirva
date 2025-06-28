// Platform-specific authentication and user data fetching

import { oauthManager, type OAuthTokenResponse, type VerificationResult } from './oauth';

export interface PlatformUser {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatar?: string;
  profileUrl: string;
  verified?: boolean;
  metadata?: Record<string, any>;
}

class PlatformAuth {
  async authenticateGitHub(accessToken: string): Promise<PlatformUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const user = await response.json();
    
    // Get user email if not public
    let email = user.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary);
        email = primaryEmail?.email;
      }
    }

    return {
      id: user.id.toString(),
      username: user.login,
      displayName: user.name || user.login,
      email: email,
      avatar: user.avatar_url,
      profileUrl: user.html_url,
      verified: true,
      metadata: {
        publicRepos: user.public_repos,
        followers: user.followers,
        following: user.following,
        createdAt: user.created_at,
        bio: user.bio,
      },
    };
  }

  async authenticateDiscord(accessToken: string): Promise<PlatformUser> {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    const user = await response.json();

    // Get user guilds
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    let guilds = [];
    if (guildsResponse.ok) {
      guilds = await guildsResponse.json();
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.global_name || user.username,
      email: user.email,
      avatar: user.avatar ? 
        `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 
        undefined,
      profileUrl: `https://discord.com/users/${user.id}`,
      verified: user.verified,
      metadata: {
        discriminator: user.discriminator,
        premiumType: user.premium_type,
        publicFlags: user.public_flags,
        guilds: guilds.length,
        mfaEnabled: user.mfa_enabled,
      },
    };
  }

  async authenticateTwitter(accessToken: string): Promise<PlatformUser> {
    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=id,username,name,profile_image_url,public_metrics,verified,description', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    const user = data.data;

    return {
      id: user.id,
      username: user.username,
      displayName: user.name,
      avatar: user.profile_image_url,
      profileUrl: `https://twitter.com/${user.username}`,
      verified: user.verified,
      metadata: {
        description: user.description,
        publicMetrics: user.public_metrics,
        followersCount: user.public_metrics?.followers_count || 0,
        followingCount: user.public_metrics?.following_count || 0,
        tweetCount: user.public_metrics?.tweet_count || 0,
      },
    };
  }

  async verifyPlatform(platform: string, code: string, state: string): Promise<VerificationResult> {
    try {
      // Validate state to prevent CSRF attacks
      // WARNING: This is insecure and only for local testing!
      // if (!oauthManager.validateOAuthState(platform, state)) {
      //   return {
      //     success: false,
      //     user: null,
      //     error: 'Invalid state parameter',
      //   };
      // }

      // Get code verifier for PKCE (Twitter)
      let codeVerifier: string | undefined = undefined;
      if (platform === 'twitter') {
        codeVerifier = oauthManager.getCodeVerifier(platform, state) || undefined;
      }

      // Exchange code for access token
      const tokenResponse = await oauthManager.exchangeCodeForToken(
        platform, 
        code, 
        codeVerifier
      );

      // Get user data from platform
      let user: PlatformUser;
      switch (platform) {
        case 'github':
          user = await this.authenticateGitHub(tokenResponse.access_token);
          break;
        case 'discord':
          user = await this.authenticateDiscord(tokenResponse.access_token);
          break;
        case 'twitter':
          user = await this.authenticateTwitter(tokenResponse.access_token);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      return {
        success: true,
        user: user,
      };
    } catch (error) {
      console.error(`Platform verification error for ${platform}:`, error);
      return {
        success: false,
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  calculateReputationScore(platform: string, user: PlatformUser): number {
    switch (platform) {
      case 'github':
        return this.calculateGitHubScore(user);
      case 'discord':
        return this.calculateDiscordScore(user);
      case 'twitter':
        return this.calculateTwitterScore(user);
      default:
        return 0;
    }
  }

  private calculateGitHubScore(user: PlatformUser): number {
    const metadata = user.metadata || {};
    let score = 0;

    // Base score for verified account
    score += 100;

    // Score from public repositories
    score += Math.min((metadata.publicRepos || 0) * 5, 200);

    // Score from followers
    score += Math.min((metadata.followers || 0) * 2, 150);

    // Account age bonus
    if (metadata.createdAt) {
      const accountAge = (Date.now() - new Date(metadata.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365);
      score += Math.min(accountAge * 50, 200);
    }

    return Math.round(Math.min(score, 800));
  }

  private calculateDiscordScore(user: PlatformUser): number {
    const metadata = user.metadata || {};
    let score = 0;

    // Base score for verified account
    if (user.verified) {
      score += 100;
    }

    // Score from guild participation
    score += Math.min((metadata.guilds || 0) * 10, 200);

    // Premium subscription bonus
    if (metadata.premiumType > 0) {
      score += 50;
    }

    // MFA enabled bonus
    if (metadata.mfaEnabled) {
      score += 25;
    }

    return Math.round(Math.min(score, 400));
  }

  private calculateTwitterScore(user: PlatformUser): number {
    const metadata = user.metadata || {};
    let score = 0;

    // Base score for verified account
    if (user.verified) {
      score += 150;
    }

    // Score from followers
    score += Math.min((metadata.followersCount || 0) * 0.5, 200);

    // Score from tweet activity
    score += Math.min((metadata.tweetCount || 0) * 0.1, 100);

    // Follower to following ratio bonus
    const followersCount = metadata.followersCount || 0;
    const followingCount = metadata.followingCount || 1;
    const ratio = followersCount / followingCount;
    if (ratio > 1) {
      score += Math.min(ratio * 10, 100);
    }

    return Math.round(Math.min(score, 500));
  }
}

export const platformAuth = new PlatformAuth();