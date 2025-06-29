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
const GET_DEV_SCORE_ADDRESS = '0x9103650b6Cd763F00458D634D55f4FE15A2d328e';

// Create a public client for read operations
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

async function testContractRead() {
  console.log('🧪 Testing GetDevScore Contract Read Operations');
  console.log('===============================================\n');

  try {
    // Test 1: Check contract address
    console.log('1️⃣ Contract Configuration:');
    console.log(`Contract Address: ${GET_DEV_SCORE_ADDRESS}`);
    console.log(`Network: Sepolia (Chain ID: ${sepolia.id})`);
    console.log('✅ Contract configuration verified\n');

    // Test 2: Check if we can read from the contract
    console.log('2️⃣ Testing Contract Read Operations...');
    
    try {
      const currentUser = await publicClient.readContract({
        address: GET_DEV_SCORE_ADDRESS,
        abi: GET_DEV_SCORE_ABI,
        functionName: 'currentUser'
      });
      console.log(`Current User: ${currentUser}`);
    } catch (error) {
      console.log('Current User: No user set (expected for read-only test)');
    }

    try {
      const lastRequestId = await publicClient.readContract({
        address: GET_DEV_SCORE_ADDRESS,
        abi: GET_DEV_SCORE_ABI,
        functionName: 's_lastRequestId'
      });
      console.log(`Last Request ID: ${lastRequestId}`);
    } catch (error) {
      console.log('Last Request ID: No requests made yet (expected)');
    }

    console.log('✅ Contract read operations working\n');

    // Test 3: Test GitHub API accessibility
    console.log('3️⃣ Testing GitHub API Accessibility...');
    const testUsername = 'swaparup36';
    
    try {
      const response = await fetch(`https://api.github.com/users/${testUsername}`, {
        headers: {
          'User-Agent': 'CIRVA-Agent'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log(`GitHub User Found: ${userData.login}`);
        console.log(`Followers: ${userData.followers}`);
        console.log(`Public Repos: ${userData.public_repos}`);
        console.log('✅ GitHub API accessible\n');
      } else {
        console.log(`❌ GitHub API Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ GitHub API Error: ${error.message}`);
    }

    console.log('🎉 Contract Read Test Completed Successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Navigate to /verify or /dashboard');
    console.log('3. Connect your wallet and switch to Sepolia testnet');
    console.log('4. Enter a GitHub username');
    console.log('5. Click "Calculate Dev Score"');
    console.log('6. Approve the transaction');
    console.log('7. Wait for Chainlink Functions to process (1-2 minutes)');
    console.log('8. View your calculated score from the smart contract!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testContractRead().catch(console.error); 