// Discord API integration for fetching user profile and guild data

export interface DiscordProfile {
  id: string;
  username: string;
  global_name: string;
  discriminator: string;
  avatar: string;
  verified: boolean;
  email: string;
  premium_type: number;
  public_flags: number;
  mfa_enabled: boolean;
  created_at?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string;
  description: string;
  member_count: number;
  joined_at: string;
}

export interface DiscordGuildMember {
  user: DiscordProfile;
  roles: string[];
  joined_at: string;
  premium_since?: string;
}

class DiscordAPI {
  private baseUrl = 'https://discord.com/api/v10';
  private token: string | undefined;

  constructor() {
    this.token = process.env.NEXT_PUBLIC_DISCORD_TOKEN;
  }

  private async request(endpoint: string, accessToken?: string): Promise<any> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (this.token) {
      headers['Authorization'] = `Bot ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProfile(accessToken: string): Promise<DiscordProfile> {
    return this.request('/users/@me', accessToken);
  }

  async getGuilds(accessToken: string, limit = 100): Promise<DiscordGuild[]> {
    return this.request(`/users/@me/guilds?limit=${limit}`, accessToken);
  }

  async getGuildMember(guildId: string, userId: string, accessToken?: string): Promise<DiscordGuildMember> {
    return this.request(`/guilds/${guildId}/members/${userId}`, accessToken);
  }

  async verifyProfileOwnership(username: string, verificationCode: string): Promise<boolean> {
    try {
      // Note: Discord doesn't have a public API to search users by username
      // In a real app, you might need to use a different verification method
      // such as having the user join a specific server or send a DM with the code
      
      // Mock verification for demonstration
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate 80% success rate
          resolve(Math.random() > 0.2);
        }, 1000);
      });
    } catch (error) {
      console.error('Error verifying Discord profile:', error);
      return false;
    }
  }

  calculateReputationScore(profile: DiscordProfile, guilds: DiscordGuild[]): number {
    let score = 0;
    
    // Base score for verified account
    if (profile.verified) {
      score += 100;
    }
    
    // Score from guild participation
    score += Math.min(guilds.length * 10, 200);
    
    // Premium subscription bonus
    if (profile.premium_type > 0) {
      score += 50;
    }
    
    // MFA enabled bonus
    if (profile.mfa_enabled) {
      score += 25;
    }
    
    // Account age bonus (estimated from Discord ID)
    if (profile.id) {
      const DISCORD_EPOCH = 1420070400000;
      const snowflake = BigInt(profile.id);
      const timestamp = Number(snowflake >> BigInt(22)) + DISCORD_EPOCH;
      const accountCreated = new Date(timestamp);
      const accountAge = (Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24 * 365);
      score += Math.min(accountAge * 30, 150);
    }
    
    return Math.round(Math.min(score, 500)); // Cap at 500
  }

  // Helper method to get user's guilds with member counts
  async getUserGuildsWithDetails(accessToken: string): Promise<DiscordGuild[]> {
    const guilds = await this.getGuilds(accessToken);
    
    // Add additional details if needed
    return guilds.map(guild => ({
      ...guild,
      member_count: guild.member_count || 0,
    }));
  }

  // Helper method to check if user is in a specific guild
  async isUserInGuild(guildId: string, accessToken: string): Promise<boolean> {
    try {
      const guilds = await this.getGuilds(accessToken);
      return guilds.some(guild => guild.id === guildId);
    } catch (error) {
      console.error('Error checking guild membership:', error);
      return false;
    }
  }
}

export const discordAPI = new DiscordAPI();