// Test script for Social Score integration
// This script tests the GetSocialScore smart contract integration

import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'wagmi/chains';

// GetSocialScore contract ABI
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
const GET_SOCIAL_SCORE_ADDRESS = '0xfA145E64eee885Db2190580B1bF2C9373a6D78CA';

// Subscription ID for Chainlink Functions
const SUBSCRIPTION_ID = 5186n;

// Create a public client for read operations
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

async function testSocialScoreContract() {
  console.log('🧪 Testing Social Score Contract Integration...\n');

  try {
    // Test 1: Read contract address
    console.log('📋 Contract Details:');
    console.log(`   Address: ${GET_SOCIAL_SCORE_ADDRESS}`);
    console.log(`   Network: Sepolia`);
    console.log(`   Subscription ID: ${SUBSCRIPTION_ID.toString()}\n`);

    // Test 2: Try to read the current social score (should be 0 for new addresses)
    console.log('📊 Testing getScore function...');
    const testAddress = '0x1234567890123456789012345678901234567890';
    
    try {
      const score = await publicClient.readContract({
        address: GET_SOCIAL_SCORE_ADDRESS,
        abi: GET_SOCIAL_SCORE_ABI,
        functionName: 'getScore',
        args: [testAddress]
      });
      console.log(`   ✅ getScore for ${testAddress}: ${score.toString()}`);
    } catch (error) {
      console.log(`   ❌ Error reading score: ${error.message}`);
    }

    // Test 3: Try to read the current user
    console.log('\n👤 Testing currentUser function...');
    try {
      const currentUser = await publicClient.readContract({
        address: GET_SOCIAL_SCORE_ADDRESS,
        abi: GET_SOCIAL_SCORE_ABI,
        functionName: 'currentUser'
      });
      console.log(`   ✅ Current user: ${currentUser}`);
    } catch (error) {
      console.log(`   ❌ Error reading current user: ${error.message}`);
    }

    // Test 4: Try to read the last request ID
    console.log('\n🆔 Testing s_lastRequestId function...');
    try {
      const lastRequestId = await publicClient.readContract({
        address: GET_SOCIAL_SCORE_ADDRESS,
        abi: GET_SOCIAL_SCORE_ABI,
        functionName: 's_lastRequestId'
      });
      console.log(`   ✅ Last request ID: ${lastRequestId}`);
    } catch (error) {
      console.log(`   ❌ Error reading last request ID: ${error.message}`);
    }

    // Test 5: Check if contract is deployed and accessible
    console.log('\n🔍 Testing contract deployment...');
    try {
      const code = await publicClient.getBytecode({
        address: GET_SOCIAL_SCORE_ADDRESS
      });
      if (code && code !== '0x') {
        console.log('   ✅ Contract is deployed and accessible');
      } else {
        console.log('   ❌ Contract is not deployed or not accessible');
      }
    } catch (error) {
      console.log(`   ❌ Error checking contract deployment: ${error.message}`);
    }

    console.log('\n✅ Social Score Contract Integration Test Complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Connect your wallet to the website');
    console.log('   2. Verify your Twitter account');
    console.log('   3. Use the SocialScoreButton to calculate your social score');
    console.log('   4. The contract will use subscriptionId = 5186');
    console.log('   5. Twitter username will be passed as the 0th element in args array');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSocialScoreContract(); 