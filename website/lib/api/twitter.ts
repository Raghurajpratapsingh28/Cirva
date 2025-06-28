// Twitter API integration for fetching user profile and data

export interface TwitterProfile {
  id: string;
  username: string;
  name: string;
  description: string;
  profile_image_url: string;
  verified: boolean;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  created_at: string;
}

export interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

class TwitterAPI {
  private baseUrl = 'https://api.twitter.com/2';
  private token: string | undefined;

  constructor() {
    this.token = process.env.NEXT_PUBLIC_TWITTER_TOKEN;
  }

  private async request(endpoint: string): Promise<any> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProfile(username: string): Promise<TwitterProfile> {
    const response = await this.request(`/users/by/username/${username}?user.fields=id,username,name,description,profile_image_url,verified,public_metrics,created_at`);
    return response.data;
  }

  async getMyProfile(accessToken: string): Promise<TwitterProfile> {
    const response = await fetch(`${this.baseUrl}/users/me?user.fields=id,username,name,description,profile_image_url,verified,public_metrics,created_at`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async getTweets(username: string, limit = 10): Promise<TwitterTweet[]> {
    const userId = await this.getUserId(username);
    const response = await this.request(
      `/users/${userId}/tweets?max_results=${limit}&tweet.fields=created_at,public_metrics`
    );
    
    return response.data?.map((tweet: any) => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      public_metrics: tweet.public_metrics,
    })) || [];
  }

  private async getUserId(username: string): Promise<string> {
    const profile = await this.getProfile(username);
    return profile.id;
  }

  async verifyProfileOwnership(username: string, verificationCode: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(username);
      
      // Check if verification code is in bio/description
      if (profile.description && profile.description.includes(verificationCode)) {
        return true;
      }
      
      // Check if verification code is in recent tweets
      const tweets = await this.getTweets(username, 50);
      for (const tweet of tweets) {
        if (tweet.text && tweet.text.includes(verificationCode)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying Twitter profile:', error);
      return false;
    }
  }

  calculateReputationScore(profile: TwitterProfile, tweets: TwitterTweet[]): number {
    let score = 0;
    
    // Base score from profile metrics
    score += Math.min(profile.public_metrics.followers_count * 0.5, 200); // Max 200 from followers
    score += Math.min(profile.public_metrics.tweet_count * 0.1, 100); // Max 100 from tweets
    
    // Score from tweet engagement
    const totalLikes = tweets.reduce((sum, tweet) => sum + tweet.public_metrics.like_count, 0);
    score += Math.min(totalLikes * 0.1, 200); // Max 200 from likes
    
    const totalRetweets = tweets.reduce((sum, tweet) => sum + tweet.public_metrics.retweet_count, 0);
    score += Math.min(totalRetweets * 0.2, 150); // Max 150 from retweets
    
    // Bonus for verified account
    if (profile.verified) {
      score += 150;
    }
    
    // Bonus for follower to following ratio
    const followersCount = profile.public_metrics.followers_count;
    const followingCount = profile.public_metrics.following_count || 1;
    const ratio = followersCount / followingCount;
    if (ratio > 1) {
      score += Math.min(ratio * 10, 100); // Max 100 from ratio
    }
    
    // Bonus for account age
    if (profile.created_at) {
      const accountAge = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
      score += Math.min(accountAge * 30, 150); // Max 150 from account age
    }
    
    return Math.round(Math.min(score, 1000)); // Cap at 1000
  }
}

export const twitterAPI = new TwitterAPI(); 