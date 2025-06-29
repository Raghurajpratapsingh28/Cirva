import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'wagmi/chains';

// GetDevScore contract ABI - extracted from the smart contract
const GET_DEV_SCORE_ABI = parseAbi([
  'function sendRequest(uint64 subscriptionId, string[] calldata args) external returns (bytes32 requestId)',
  'function getScore(address _developerAddress) external view returns (uint256)',
  'function devScore() external view returns (uint256)',
  'function developerScores(address) external view returns (uint256)',
  'function currentUser() external view returns (address)',
  'function s_lastRequestId() external view returns (bytes32)',
  'function s_lastResponse() external view returns (bytes)',
  'function s_lastError() external view returns (bytes)',
  'event Response(bytes32 indexed requestId, uint256 devScore, bytes response, bytes err)'
]);

// Contract address on Sepolia
export const GET_DEV_SCORE_ADDRESS = '0x9103650b6Cd763F00458D634D55f4FE15A2d328e' as const;

// Subscription ID for Chainlink Functions
export const SUBSCRIPTION_ID = 5186n;

// Create a public client for read operations
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

export interface DevScoreContract {
  sendRequest: (subscriptionId: bigint, args: string[]) => Promise<`0x${string}`>;
  getScore: (developerAddress: `0x${string}`) => Promise<bigint>;
  devScore: () => Promise<bigint>;
  developerScores: (address: `0x${string}`) => Promise<bigint>;
  currentUser: () => Promise<`0x${string}`>;
  s_lastRequestId: () => Promise<`0x${string}`>;
  s_lastResponse: () => Promise<`0x${string}`>;
  s_lastError: () => Promise<`0x${string}`>;
}

// Function to get dev score for a GitHub username
export async function getDevScoreForGitHub(
  walletClient: any,
  githubUsername: string
): Promise<`0x${string}`> {
  try {
    const [account] = await walletClient.getAddresses();
    
    const { request } = await publicClient.simulateContract({
      account,
      address: GET_DEV_SCORE_ADDRESS,
      abi: GET_DEV_SCORE_ABI,
      functionName: 'sendRequest',
      args: [SUBSCRIPTION_ID, [githubUsername]]
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (error) {
    console.error('Error calling getDevScoreForGitHub:', error);
    throw error;
  }
}

// Function to get the stored dev score for an address
export async function getStoredDevScore(developerAddress: `0x${string}`): Promise<bigint> {
  try {
    const score = await publicClient.readContract({
      address: GET_DEV_SCORE_ADDRESS,
      abi: GET_DEV_SCORE_ABI,
      functionName: 'getScore',
      args: [developerAddress]
    });
    return score;
  } catch (error) {
    console.error('Error reading dev score:', error);
    throw error;
  }
}

// Function to get the current user from the contract
export async function getCurrentUser(): Promise<`0x${string}`> {
  try {
    const user = await publicClient.readContract({
      address: GET_DEV_SCORE_ADDRESS,
      abi: GET_DEV_SCORE_ABI,
      functionName: 'currentUser'
    });
    return user;
  } catch (error) {
    console.error('Error reading current user:', error);
    throw error;
  }
}

// Function to get the last request ID
export async function getLastRequestId(): Promise<`0x${string}`> {
  try {
    const requestId = await publicClient.readContract({
      address: GET_DEV_SCORE_ADDRESS,
      abi: GET_DEV_SCORE_ABI,
      functionName: 's_lastRequestId'
    });
    return requestId;
  } catch (error) {
    console.error('Error reading last request ID:', error);
    throw error;
  }
} 