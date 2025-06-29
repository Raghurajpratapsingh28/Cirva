import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'wagmi/chains';

// GetSocialScore contract ABI - extracted from the smart contract
const GET_SOCIAL_SCORE_ABI = parseAbi([
  'function sendRequest(uint64 subscriptionId, string[] calldata args) external returns (bytes32 requestId)',
  'function getScore(address _developerAddress) external view returns (uint256)',
  'function socialScore() external view returns (uint256)',
  'function socialScoresMap(address) external view returns (uint256)',
  'function currentUser() external view returns (address)',
  'function s_lastRequestId() external view returns (bytes32)',
  'function s_lastResponse() external view returns (bytes)',
  'function s_lastError() external view returns (bytes)',
  'event Response(bytes32 indexed requestId, uint256 socialScore, bytes response, bytes err)'
]);

// Contract address on Sepolia
export const GET_SOCIAL_SCORE_ADDRESS = '0xfA145E64eee885Db2190580B1bF2C9373a6D78CA' as const;

// Subscription ID for Chainlink Functions
export const SUBSCRIPTION_ID = 5186n;

// Create a public client for read operations
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

export interface SocialScoreContract {
  sendRequest: (subscriptionId: bigint, args: string[]) => Promise<`0x${string}`>;
  getScore: (developerAddress: `0x${string}`) => Promise<bigint>;
  socialScore: () => Promise<bigint>;
  socialScoresMap: (address: `0x${string}`) => Promise<bigint>;
  currentUser: () => Promise<`0x${string}`>;
  s_lastRequestId: () => Promise<`0x${string}`>;
  s_lastResponse: () => Promise<`0x${string}`>;
  s_lastError: () => Promise<`0x${string}`>;
}

// Function to get social score for a Twitter username
export async function getSocialScoreForTwitter(
  walletClient: any,
  twitterUsername: string
): Promise<`0x${string}`> {
  try {
    const [account] = await walletClient.getAddresses();
    
    const { request } = await publicClient.simulateContract({
      account,
      address: GET_SOCIAL_SCORE_ADDRESS,
      abi: GET_SOCIAL_SCORE_ABI,
      functionName: 'sendRequest',
      args: [SUBSCRIPTION_ID, [twitterUsername]]
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (error) {
    console.error('Error calling getSocialScoreForTwitter:', error);
    throw error;
  }
}

// Function to get the stored social score for an address
export async function getStoredSocialScore(developerAddress: `0x${string}`): Promise<bigint> {
  try {
    const score = await publicClient.readContract({
      address: GET_SOCIAL_SCORE_ADDRESS,
      abi: GET_SOCIAL_SCORE_ABI,
      functionName: 'getScore',
      args: [developerAddress]
    });
    return score;
  } catch (error) {
    console.error('Error reading social score:', error);
    throw error;
  }
}

// Function to get the current user from the contract
export async function getCurrentUser(): Promise<`0x${string}`> {
  try {
    const user = await publicClient.readContract({
      address: GET_SOCIAL_SCORE_ADDRESS,
      abi: GET_SOCIAL_SCORE_ABI,
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
      address: GET_SOCIAL_SCORE_ADDRESS,
      abi: GET_SOCIAL_SCORE_ABI,
      functionName: 's_lastRequestId'
    });
    return requestId;
  } catch (error) {
    console.error('Error reading last request ID:', error);
    throw error;
  }
} 