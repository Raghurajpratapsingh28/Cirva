import { ethers } from 'ethers';
import { toast } from 'sonner';

// Reputation struct interface
export interface Reputation {
  reputationScore: bigint;
  devRating: number;
  communityRating: number;
  socialRating: number;
  defiRating: number;
  overallRating: string;
}

// Reputation data interface
export interface ReputationData {
  overallScore: bigint;
  developerScore: bigint;
  contributorScore: bigint;
  socialScore: bigint;
  defiScore: bigint;
  lastUpdated: bigint;
  ipfsHash: string;
  isActive: boolean;
  reputation: Reputation;
}

// Chain selectors (Testnet)
export const CHAIN_SELECTORS = {
  SEPOLIA: 16015286601757825753n,
  MUMBAI: 12532609583862916517n,
  SEPOLIA_OPTIMISM: 2664363617261496610n,
  SEPOLIA_ARBITRUM: 4949039107694359620n,
  SEPOLIA_BASE: 15971525489660198786n,
} as const;

// Network configuration (Testnet)
export const NETWORKS = {
  [CHAIN_SELECTORS.SEPOLIA.toString()]: {
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/your-key',
    explorer: 'https://sepolia.etherscan.io',
  },
  [CHAIN_SELECTORS.MUMBAI.toString()]: {
    name: 'Mumbai',
    chainId: 80001,
    rpcUrl: 'https://polygon-mumbai.infura.io/v3/your-key',
    explorer: 'https://mumbai.polygonscan.com',
  },
  [CHAIN_SELECTORS.SEPOLIA_OPTIMISM.toString()]: {
    name: 'Sepolia Optimism',
    chainId: 11155420,
    rpcUrl: 'https://sepolia.optimism.io',
    explorer: 'https://sepolia-optimism.etherscan.io',
  },
  [CHAIN_SELECTORS.SEPOLIA_ARBITRUM.toString()]: {
    name: 'Sepolia Arbitrum',
    chainId: 421614,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorer: 'https://sepolia.arbiscan.io',
  },
  [CHAIN_SELECTORS.SEPOLIA_BASE.toString()]: {
    name: 'Sepolia Base',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    explorer: 'https://sepolia.basescan.org',
  },
} as const;

/**
 * CCIP Manager for cross-chain reputation operations (Testnet Version)
 */
export class CirvaCCIPManager {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private contracts: Map<bigint, ethers.Contract> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(provider: ethers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Get reputation data for a user
   */
  async getReputationData(userAddress: string, chainSelector?: bigint): Promise<ReputationData | null> {
    try {
      const contract = await this.getContract(chainSelector);
      if (!contract) return null;

      const reputation = await contract.getReputation(userAddress);
      
      if (!reputation.isActive) {
        return null;
      }

      return {
        overallScore: reputation.overallScore,
        developerScore: reputation.developerScore,
        contributorScore: reputation.contributorScore,
        socialScore: reputation.socialScore,
        defiScore: reputation.defiScore,
        lastUpdated: reputation.lastUpdated,
        ipfsHash: reputation.ipfsHash,
        isActive: reputation.isActive,
        reputation: {
          reputationScore: reputation.reputation.reputationScore,
          devRating: Number(reputation.reputation.devRating),
          communityRating: Number(reputation.reputation.communityRating),
          socialRating: Number(reputation.reputation.socialRating),
          defiRating: Number(reputation.reputation.defiRating),
          overallRating: reputation.reputation.overallRating,
        },
      };
    } catch (error) {
      console.error('Error getting reputation data:', error);
      return null;
    }
  }

  /**
   * Get user's Reputation struct specifically
   */
  async getUserReputationStruct(userAddress: string, chainSelector?: bigint): Promise<Reputation | null> {
    try {
      const contract = await this.getContract(chainSelector);
      if (!contract) return null;

      const reputation = await contract.getUserReputationStruct(userAddress);
      
      return {
        reputationScore: reputation.reputationScore,
        devRating: Number(reputation.devRating),
        communityRating: Number(reputation.communityRating),
        socialRating: Number(reputation.socialRating),
        defiRating: Number(reputation.defiRating),
        overallRating: reputation.overallRating,
      };
    } catch (error) {
      console.error('Error getting reputation struct:', error);
      return null;
    }
  }

  /**
   * Sync reputation data to another chain
   */
  async syncToChain(userAddress: string, destinationChainSelector: bigint): Promise<boolean> {
    try {
      const contract = await this.getContract();
      if (!contract) {
        toast.error('Contract not found');
        return false;
      }

      const tx = await contract.syncToChain(userAddress, destinationChainSelector);
      await tx.wait();

      toast.success(`Syncing to ${NETWORKS[destinationChainSelector.toString()]?.name || 'destination chain'}`);
      
      // Emit sync event
      this.emitEvent('sync_initiated', {
        userAddress,
        destinationChain: destinationChainSelector,
        networkName: NETWORKS[destinationChainSelector.toString()]?.name,
      });

      return true;
    } catch (error) {
      console.error('Error syncing to chain:', error);
      toast.error('Failed to sync reputation data');
      return false;
    }
  }

  /**
   * Get sync status for a user
   */
  async getSyncStatus(userAddress: string, chainSelector: bigint): Promise<{
    lastSync: bigint;
    isSupported: boolean;
  }> {
    try {
      const contract = await this.getContract();
      if (!contract) {
        return { lastSync: 0n, isSupported: false };
      }

      const lastSync = await contract.getLastSyncTimestamp(userAddress, chainSelector);
      const isSupported = await contract.isChainSupported(chainSelector);

      return { lastSync, isSupported };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return { lastSync: 0n, isSupported: false };
    }
  }

  /**
   * Listen for sync events
   */
  async listenForSyncEvents(userAddress: string, callback: (event: any) => void): Promise<void> {
    try {
      const contract = await this.getContract();
      if (!contract) return;

      // Listen for CrossChainSyncInitiated events
      contract.on('CrossChainSyncInitiated', (user: string, destinationChain: bigint, messageId: bigint) => {
        if (user.toLowerCase() === userAddress.toLowerCase()) {
          callback({
            type: 'sync_initiated',
            userAddress: user,
            destinationChain,
            messageId,
            networkName: NETWORKS[destinationChain.toString()]?.name,
          });
        }
      });

      // Listen for CrossChainSyncReceived events
      contract.on('CrossChainSyncReceived', (user: string, sourceChain: bigint, overallScore: bigint) => {
        if (user.toLowerCase() === userAddress.toLowerCase()) {
          callback({
            type: 'sync_received',
            userAddress: user,
            sourceChain,
            overallScore,
            networkName: NETWORKS[sourceChain.toString()]?.name,
          });
        }
      });

      // Store callback for cleanup
      const eventKey = `sync_${userAddress}`;
      if (!this.eventListeners.has(eventKey)) {
        this.eventListeners.set(eventKey, []);
      }
      this.eventListeners.get(eventKey)!.push(callback);

    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }

  /**
   * Stop listening for sync events
   */
  async stopListeningForSyncEvents(userAddress: string): Promise<void> {
    try {
      const contract = await this.getContract();
      if (!contract) return;

      // Remove all listeners for this contract
      contract.removeAllListeners('CrossChainSyncInitiated');
      contract.removeAllListeners('CrossChainSyncReceived');

      // Clear stored callbacks
      const eventKey = `sync_${userAddress}`;
      this.eventListeners.delete(eventKey);

    } catch (error) {
      console.error('Error stopping event listeners:', error);
    }
  }

  /**
   * Get contract instance for a specific chain
   */
  private async getContract(chainSelector?: bigint): Promise<ethers.Contract | null> {
    try {
      // If no chain selector provided, use current network
      if (!chainSelector) {
        const network = await this.provider.getNetwork();
        chainSelector = BigInt(network.chainId);
      }

      // Check if contract is already cached
      if (this.contracts.has(chainSelector)) {
        return this.contracts.get(chainSelector)!;
      }

      // Get contract address for the chain
      const contractAddress = await this.getContractAddress(chainSelector);
      if (!contractAddress) {
        console.error(`No contract address found for chain ${chainSelector}`);
        return null;
      }

      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        this.getContractABI(),
        this.signer
      );

      // Cache the contract
      this.contracts.set(chainSelector, contract);
      return contract;

    } catch (error) {
      console.error('Error getting contract:', error);
      return null;
    }
  }

  /**
   * Get contract address for a specific chain
   */
  private async getContractAddress(chainSelector: bigint): Promise<string | null> {
    // In a real implementation, you would store contract addresses
    // This is a placeholder - replace with actual deployed addresses
    const contractAddresses: Record<string, string> = {
      [CHAIN_SELECTORS.SEPOLIA.toString()]: '0x...', // Replace with actual Sepolia address
      [CHAIN_SELECTORS.MUMBAI.toString()]: '0x...', // Replace with actual Mumbai address
      [CHAIN_SELECTORS.SEPOLIA_OPTIMISM.toString()]: '0x...', // Replace with actual Sepolia Optimism address
      [CHAIN_SELECTORS.SEPOLIA_ARBITRUM.toString()]: '0x...', // Replace with actual Sepolia Arbitrum address
      [CHAIN_SELECTORS.SEPOLIA_BASE.toString()]: '0x...', // Replace with actual Sepolia Base address
    };

    return contractAddresses[chainSelector.toString()] || null;
  }

  /**
   * Get contract ABI
   */
  private getContractABI(): any[] {
    // This would be the actual ABI from your compiled contracts
    // For now, returning a minimal ABI with the functions we need
    return [
      'function getReputation(address user) external view returns (tuple(uint256 overallScore, uint256 developerScore, uint256 contributorScore, uint256 socialScore, uint256 defiScore, uint256 lastUpdated, string ipfsHash, bool isActive, tuple(uint256 reputationScore, uint16 devRating, uint16 communityRating, uint16 socialRating, uint16 defiRating, string overallRating) reputation))',
      'function getUserReputationStruct(address user) external view returns (tuple(uint256 reputationScore, uint16 devRating, uint16 communityRating, uint16 socialRating, uint16 defiRating, string overallRating))',
      'function syncToChain(address user, uint64 destinationChainSelector) external',
      'function getLastSyncTimestamp(address user, uint64 chainSelector) external view returns (uint256)',
      'function isChainSupported(uint64 chainSelector) external view returns (bool)',
      'event CrossChainSyncInitiated(address indexed user, uint64 destinationChain, uint256 messageId)',
      'event CrossChainSyncReceived(address indexed user, uint64 sourceChain, uint256 overallScore)',
    ];
  }

  /**
   * Emit custom event
   */
  private emitEvent(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.contracts.clear();
    this.eventListeners.clear();
  }
} 