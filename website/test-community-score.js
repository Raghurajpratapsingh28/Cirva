// Test script for Community Score integration
const { ethers } = require('ethers');

// Contract ABI for GetCommunityScore
const GET_COMMUNITY_SCORE_ABI = [
  'function sendRequest(uint64 subscriptionId, string[] calldata args) external returns (bytes32 requestId)',
  'function getScore(address _developerAddress) external view returns (uint256)',
  'function communityScore() external view returns (uint256)',
  'function communityScoresMap(address) external view returns (uint256)',
  'function currentUser() external view returns (address)',
  'function s_lastRequestId() external view returns (bytes32)',
  'function s_lastResponse() external view returns (bytes)',
  'function s_lastError() external view returns (bytes)',
  'event Response(bytes32 indexed requestId, uint256 communityScore, bytes response, bytes err)'
];

// Contract address on Sepolia
const GET_COMMUNITY_SCORE_ADDRESS = '0x9847bEca9D483707261Cbd70263B091eFafeAdc4';

// Subscription ID for Chainlink Functions
const SUBSCRIPTION_ID = 5186;

async function testCommunityScore() {
  try {
    // Connect to Sepolia testnet
    const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_INFURA_KEY');
    
    // Create contract instance
    const contract = new ethers.Contract(GET_COMMUNITY_SCORE_ADDRESS, GET_COMMUNITY_SCORE_ABI, provider);
    
    console.log('🔍 Testing Community Score Contract...');
    console.log('Contract Address:', GET_COMMUNITY_SCORE_ADDRESS);
    console.log('Subscription ID:', SUBSCRIPTION_ID);
    
    // Test reading functions
    console.log('\n📖 Reading contract state...');
    
    try {
      const communityScore = await contract.communityScore();
      console.log('Current Community Score:', communityScore.toString());
    } catch (error) {
      console.log('No community score set yet');
    }
    
    try {
      const currentUser = await contract.currentUser();
      console.log('Current User:', currentUser);
    } catch (error) {
      console.log('No current user set');
    }
    
    try {
      const lastRequestId = await contract.s_lastRequestId();
      console.log('Last Request ID:', lastRequestId);
    } catch (error) {
      console.log('No last request ID');
    }
    
    // Test with a sample Discord user ID and server ID
    const testDiscordUserId = '123456789012345678'; // Example Discord user ID
    const testDiscordServerId = '987654321098765432'; // Example Discord server ID
    
    console.log('\n🧪 Test Parameters:');
    console.log('Discord User ID:', testDiscordUserId);
    console.log('Discord Server ID:', testDiscordServerId);
    console.log('Args Array:', [testDiscordUserId, testDiscordServerId]);
    
    console.log('\n✅ Community Score contract integration test completed!');
    console.log('\n📝 To test the full integration:');
    console.log('1. Connect your wallet to Sepolia testnet');
    console.log('2. Navigate to the dashboard');
    console.log('3. Use the Community Score button with your Discord User ID and Server ID');
    console.log('4. The contract will call Chainlink Functions with subscriptionId = 5186');
    console.log('5. The args array will contain [discordUserId, discordServerId]');
    
  } catch (error) {
    console.error('❌ Error testing community score:', error);
  }
}

// Run the test
testCommunityScore(); 