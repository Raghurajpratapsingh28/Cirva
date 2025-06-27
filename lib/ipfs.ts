// IPFS utilities for storing and retrieving profile data
// In a real application, you would use web3.storage or nft.storage

export interface UserProfile {
  address: string;
  ens?: string;
  reputation: {
    overall: number;
    developer: number;
    contributor: number;
    social: number;
    defi: number;
  };
  badges: Badge[];
  verifiedPlatforms: VerifiedPlatform[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
  category: string;
}

export interface VerifiedPlatform {
  platform: string;
  username: string;
  verifiedAt: string;
  profileUrl: string;
  points: number;
}

// Mock IPFS client - in real app, initialize with web3.storage
class MockIPFSClient {
  private storage = new Map<string, any>();

  async store(data: any): Promise<string> {
    const hash = `Qm${Math.random().toString(36).substring(2, 15)}`;
    this.storage.set(hash, data);
    return hash;
  }

  async retrieve(hash: string): Promise<any> {
    const data = this.storage.get(hash);
    if (!data) {
      throw new Error('Data not found');
    }
    return data;
  }

  async pin(hash: string): Promise<void> {
    // Mock pinning - in real app, ensure data persistence
    console.log(`Pinned ${hash} to IPFS`);
  }
}

export const ipfsClient = new MockIPFSClient();

export async function storeProfileData(profile: UserProfile): Promise<string> {
  try {
    const hash = await ipfsClient.store(profile);
    await ipfsClient.pin(hash);
    return hash;
  } catch (error) {
    console.error('Error storing profile data:', error);
    throw error;
  }
}

export async function getProfileData(hash: string): Promise<UserProfile> {
  try {
    const profile = await ipfsClient.retrieve(hash);
    return profile;
  } catch (error) {
    console.error('Error retrieving profile data:', error);
    throw error;
  }
}

export async function updateProfileData(
  currentHash: string,
  updates: Partial<UserProfile>
): Promise<string> {
  try {
    const currentProfile = await getProfileData(currentHash);
    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      metadata: {
        ...currentProfile.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
    
    return await storeProfileData(updatedProfile);
  } catch (error) {
    console.error('Error updating profile data:', error);
    throw error;
  }
}

// Utility functions for working with IPFS URLs
export function getIPFSUrl(hash: string): string {
  return `https://ipfs.io/ipfs/${hash}`;
}

export function getIPFSGatewayUrl(hash: string, gateway = 'https://cloudflare-ipfs.com'): string {
  return `${gateway}/ipfs/${hash}`;
}

// Badge metadata helpers
export function generateBadgeMetadata(badge: Omit<Badge, 'id'>): Badge {
  return {
    id: `badge_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    ...badge,
  };
}

export async function storeBadgeMetadata(badge: Badge): Promise<string> {
  const metadata = {
    name: badge.name,
    description: badge.description,
    image: badge.imageUrl,
    attributes: [
      {
        trait_type: 'Rarity',
        value: badge.rarity,
      },
      {
        trait_type: 'Category',
        value: badge.category,
      },
      {
        trait_type: 'Earned Date',
        value: badge.earnedAt,
      },
    ],
  };

  return await ipfsClient.store(metadata);
}