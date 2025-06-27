// Discord API integration for user verification

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string;
  description: string;
  member_count: number;
  joined_at: string;
}

class DiscordAPI {
  private baseUrl = 'https://discord.com/api/v10';
  private clientId: string | undefined;
  private clientSecret: string | undefined;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    this.clientSecret = process.env.DISCORD_CLIENT_SECRET;
  }

  async getAuthUrl(redirectUri: string, state: string): Promise<string> {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId || '',
      scope: 'identify guilds',
      redirect_uri: redirectUri,
      state: state,
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: this.clientId || '',
        client_secret: this.clientSecret || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord OAuth error: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async getUser(accessToken: string): Promise<DiscordUser> {
    const response = await fetch(`${this.baseUrl}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return response.json();
  }

  async getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
    const response = await fetch(`${this.baseUrl}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return response.json();
  }

  async verifyUserInGuild(accessToken: string, guildId: string): Promise<boolean> {
    try {
      const guilds = await this.getUserGuilds(accessToken);
      return guilds.some(guild => guild.id === guildId);
    } catch (error) {
      console.error('Error verifying Discord guild membership:', error);
      return false;
    }
  }

  calculateReputationScore(user: DiscordUser, guilds: DiscordGuild[]): number {
    let score = 0;
    
    // Base score for verified account
    if (user.verified) {
      score += 100;
    }
    
    // Score from account age (estimated from Discord ID)
    const accountCreated = new Date(Number(BigInt(user.id) >> 22n) + 1420070400000);
    const accountAge = (Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24 * 365);
    score += Math.min(accountAge * 30, 150);
    
    // Score from guild participation
    score += Math.min(guilds.length * 10, 200);
    
    // Bonus for premium subscription
    if (user.premium_type && user.premium_type > 0) {
      score += 50;
    }
    
    return Math.round(Math.min(score, 500)); // Cap at 500
  }

  // Mock verification for demo purposes
  async mockVerifyUser(username: string, verificationCode: string): Promise<boolean> {
    // In a real app, this would check if the user has the verification code
    // in their Discord status or bio
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 80% success rate
        resolve(Math.random() > 0.2);
      }, 1000);
    });
  }
}

export const discordAPI = new DiscordAPI();