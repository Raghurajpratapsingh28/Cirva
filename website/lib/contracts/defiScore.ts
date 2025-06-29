import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'wagmi/chains';

// GetDefiScore contract ABI
const GET_DEFI_SCORE_ABI = parseAbi([
  'function sendRequest(uint64 subscriptionId, string[] calldata args) external returns (bytes32 requestId)',
  'function getScore(address _developerAddress) external view returns (uint256)',
  'function defiScore() external view returns (uint256)',
  'function defiScoresMap(address) external view returns (uint256)',
  'function currentUser() external view returns (address)',
  'function s_lastRequestId() external view returns (bytes32)',
  'function s_lastResponse() external view returns (bytes)',
  'function s_lastError() external view returns (bytes)',
  'event Response(bytes32 indexed requestId, uint256 defiScore, bytes response, bytes err)'
]);

// Contract address on Sepolia
export const GET_DEFI_SCORE_ADDRESS = '0x5593b14639b27cdcc9e75e0e6ba4ab2319aa15f9' as const;

// Subscription ID for Chainlink Functions
export const SUBSCRIPTION_ID = 5186n;

// Create a public client for read operations
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

export interface DefiScoreContract {
  sendRequest: (subscriptionId: bigint, args: string[]) => Promise<`0x${string}`>;
  getScore: (developerAddress: `0x${string}`) => Promise<bigint>;
  defiScore: () => Promise<bigint>;
  defiScoresMap: (address: `0x${string}`) => Promise<bigint>;
  currentUser: () => Promise<`0x${string}`>;
  s_lastRequestId: () => Promise<`0x${string}`>;
  s_lastResponse: () => Promise<`0x${string}`>;
  s_lastError: () => Promise<`0x${string}`>;
}

// Function to get DeFi score for a wallet and chain
export async function getDefiScoreForWallet(
  walletClient: any,
  walletAddress: string,
  chainSlug: string
): Promise<`0x${string}`> {
  try {
    const [account] = await walletClient.getAddresses();
    const { request } = await publicClient.simulateContract({
      account,
      address: GET_DEFI_SCORE_ADDRESS,
      abi: GET_DEFI_SCORE_ABI,
      functionName: 'sendRequest',
      args: [SUBSCRIPTION_ID, [walletAddress, chainSlug]]
    });
    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (error) {
    console.error('Error calling getDefiScoreForWallet:', error);
    throw error;
  }
}

// Function to get the stored DeFi score for an address
export async function getStoredDefiScore(developerAddress: `0x${string}`): Promise<bigint> {
  try {
    const score = await publicClient.readContract({
      address: GET_DEFI_SCORE_ADDRESS,
      abi: GET_DEFI_SCORE_ABI,
      functionName: 'getScore',
      args: [developerAddress]
    });
    return score;
  } catch (error) {
    console.error('Error reading defi score:', error);
    throw error;
  }
} 