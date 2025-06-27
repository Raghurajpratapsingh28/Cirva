// GitHub API integration for fetching user profile and contribution data

export interface GitHubProfile {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubContribution {
  date: string;
  count: number;
}

export interface GitHubRepository {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  created_at: string;
  updated_at: string;
}

class GitHubAPI {
  private baseUrl = 'https://api.github.com';
  private token: string | undefined;

  constructor() {
    this.token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  }

  private async request(endpoint: string): Promise<any> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProfile(username: string): Promise<GitHubProfile> {
    return this.request(`/users/${username}`);
  }

  async getRepositories(username: string, limit = 10): Promise<GitHubRepository[]> {
    const repos = await this.request(
      `/users/${username}/repos?sort=updated&per_page=${limit}`
    );
    
    return repos.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
    }));
  }

  async getContributions(username: string): Promise<GitHubContribution[]> {
    // Note: GitHub's contribution graph API is not public
    // In a real app, you might need to scrape the contributions page
    // or use a third-party service
    
    // Mock data for demonstration
    const contributions: GitHubContribution[] = [];
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      contributions.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10),
      });
    }
    
    return contributions.reverse();
  }

  async verifyProfileOwnership(username: string, verificationCode: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(username);
      
      // Check if verification code is in bio
      if (profile.bio && profile.bio.includes(verificationCode)) {
        return true;
      }
      
      // Check if verification code is in any repository description
      const repos = await this.getRepositories(username, 50);
      for (const repo of repos) {
        if (repo.description && repo.description.includes(verificationCode)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying GitHub profile:', error);
      return false;
    }
  }

  calculateReputationScore(profile: GitHubProfile, repos: GitHubRepository[]): number {
    let score = 0;
    
    // Base score from profile metrics
    score += Math.min(profile.public_repos * 5, 200); // Max 200 from repos
    score += Math.min(profile.followers * 2, 100); // Max 100 from followers
    
    // Score from repository quality
    const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0);
    score += Math.min(totalStars * 1.5, 300); // Max 300 from stars
    
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks, 0);
    score += Math.min(totalForks * 2, 200); // Max 200 from forks
    
    // Bonus for account age
    const accountAge = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
    score += Math.min(accountAge * 50, 200); // Max 200 from account age
    
    return Math.round(Math.min(score, 1000)); // Cap at 1000
  }
}

export const githubAPI = new GitHubAPI();