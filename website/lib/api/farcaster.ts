// Farcaster API integration using Neynar API

export interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  bio: string;
  pfp_url: string;
  follower_count: number;
  following_count: number;
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
}

export interface FarcasterCast {
  hash: string;
  text: string;
  timestamp: string;
  author: {
    username: string;
    display_name: string;
  };
  reactions: {
    likes: number;
    recasts: number;
    replies: number;
  };
}

class FarcasterAPI {
  private baseUrl = 'https://api.neynar.com/v2';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
  }

  private async request(endpoint: string, params?: Record<string, string>): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'api_key': this.apiKey || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Farcaster API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUserByUsername(username: string): Promise<FarcasterUser> {
    const data = await this.request('/farcaster/user/by_username', { username });
    return data.user;
  }

  async getUserByFid(fid: number): Promise<FarcasterUser> {
    const data = await this.request(`/farcaster/user`, { fid: fid.toString() });
    return data.user;
  }

  async getUserCasts(fid: number, limit = 25): Promise<FarcasterCast[]> {
    const data = await this.request('/farcaster/casts', {
      fid: fid.toString(),
      limit: limit.toString(),
    });
    return data.casts;
  }

  async verifyEthereumAddress(username: string, address: string): Promise<boolean> {
    try {
      const user = await this.getUserByUsername(username);
      return user.verified_addresses.eth_addresses
        .map(addr => addr.toLowerCase())
        .includes(address.toLowerCase());
    } catch (error) {
      console.error('Error verifying Farcaster Ethereum address:', error);
      return false;
    }
  }

  async verifyProfileOwnership(username: string, verificationCode: string): Promise<boolean> {
    try {
      const user = await this.getUserByUsername(username);
      
      // Check if verification code is in bio
      if (user.bio && user.bio.includes(verificationCode)) {
        return true;
      }
      
      // Check recent casts for verification code
      const casts = await this.getUserCasts(user.fid, 10);
      for (const cast of casts) {
        if (cast.text.includes(verificationCode)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying Farcaster profile:', error);
      return false;
    }
  }

  calculateReputationScore(user: FarcasterUser, casts: FarcasterCast[]): number {
    let score = 0;
    
    // Base score from followers
    score += Math.min(user.follower_count * 0.5, 200);
    
    // Score from following ratio (avoid follow-for-follow accounts)
    const followRatio = user.follower_count / Math.max(user.following_count, 1);
    if (followRatio > 1) {
      score += Math.min(followRatio * 10, 100);
    }
    
    // Score from cast engagement
    const totalLikes = casts.reduce((sum, cast) => sum + cast.reactions.likes, 0);
    const totalRecasts = casts.reduce((sum, cast) => sum + cast.reactions.recasts, 0);
    const totalReplies = casts.reduce((sum, cast) => sum + cast.reactions.replies, 0);
    
    score += Math.min(totalLikes * 0.5, 150);
    score += Math.min(totalRecasts * 1, 100);
    score += Math.min(totalReplies * 0.8, 100);
    
    // Bonus for verified Ethereum addresses
    score += user.verified_addresses.eth_addresses.length * 25;
    
    return Math.round(Math.min(score, 800)); // Cap at 800
  }

  // Mock verification for demo purposes
  async mockVerifyUser(username: string, verificationCode: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 85% success rate
        resolve(Math.random() > 0.15);
      }, 1500);
    });
  }
}

export const farcasterAPI = new FarcasterAPI();