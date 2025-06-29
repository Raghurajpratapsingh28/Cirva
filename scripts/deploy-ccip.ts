import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting CCIP contract deployment (Testnet)...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Chain selectors (Testnet)
  const SEPOLIA = 16015286601757825753n;
  const MUMBAI = 12532609583862916517n;
  const SEPOLIA_OPTIMISM = 2664363617261496610n;
  const SEPOLIA_ARBITRUM = 4949039107694359620n;
  const SEPOLIA_BASE = 15971525489660198786n;

  // Router addresses (Testnet)
  const SEPOLIA_ROUTER = "0xD0daae2231E9CB96b94C8512223533293C3693Bf";
  const MUMBAI_ROUTER = "0x70499c328e1E2a3c41108bd3730F6670a44595D1";
  const SEPOLIA_OPTIMISM_ROUTER = "0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7";
  const SEPOLIA_ARBITRUM_ROUTER = "0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7";
  const SEPOLIA_BASE_ROUTER = "0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7";

  // LINK token addresses (Testnet)
  const SEPOLIA_LINK = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
  const MUMBAI_LINK = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
  const SEPOLIA_OPTIMISM_LINK = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
  const SEPOLIA_ARBITRUM_LINK = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
  const SEPOLIA_BASE_LINK = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

  // Get current network
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  console.log("Current chain ID:", chainId);

  if (chainId === 11155111n) {
    // Deploy on Sepolia (Native Contract)
    await deployNativeContracts();
  } else {
    // Deploy on other testnets (Mirror Contracts)
    await deployMirrorContracts();
  }

  console.log("✅ Deployment completed successfully!");
}

async function deployNativeContracts() {
  console.log("📦 Deploying native contracts on Sepolia...");

  const SEPOLIA_ROUTER = "0xD0daae2231E9CB96b94C8512223533293C3693Bf";
  const SEPOLIA_LINK = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
  const MUMBAI = 12532609583862916517n;
  const SEPOLIA_OPTIMISM = 2664363617261496610n;
  const SEPOLIA_ARBITRUM = 4949039107694359620n;
  const SEPOLIA_BASE = 15971525489660198786n;

  // Deploy CirvaReputation
  console.log("Deploying CirvaReputation...");
  const CirvaReputationFactory = await ethers.getContractFactory("CirvaReputation");
  const reputationContract = await CirvaReputationFactory.deploy(
    SEPOLIA_ROUTER,
    SEPOLIA_LINK
  );
  await reputationContract.waitForDeployment();
  const reputationAddress = await reputationContract.getAddress();
  console.log("CirvaReputation deployed at:", reputationAddress);

  // Deploy CirvaDataRequestHandler
  console.log("Deploying CirvaDataRequestHandler...");
  const CirvaDataRequestHandlerFactory = await ethers.getContractFactory("CirvaDataRequestHandler");
  const requestHandler = await CirvaDataRequestHandlerFactory.deploy(
    SEPOLIA_ROUTER,
    SEPOLIA_LINK,
    reputationAddress
  );
  await requestHandler.waitForDeployment();
  const requestHandlerAddress = await requestHandler.getAddress();
  console.log("CirvaDataRequestHandler deployed at:", requestHandlerAddress);

  // Configure supported chains
  console.log("Configuring supported chains...");
  await reputationContract.setChainSupport(MUMBAI, true);
  await reputationContract.setChainSupport(SEPOLIA_OPTIMISM, true);
  await reputationContract.setChainSupport(SEPOLIA_ARBITRUM, true);
  await reputationContract.setChainSupport(SEPOLIA_BASE, true);

  // Configure trusted request chains
  console.log("Configuring trusted request chains...");
  await requestHandler.setTrustedRequestChain(MUMBAI, true);
  await requestHandler.setTrustedRequestChain(SEPOLIA_OPTIMISM, true);
  await requestHandler.setTrustedRequestChain(SEPOLIA_ARBITRUM, true);
  await requestHandler.setTrustedRequestChain(SEPOLIA_BASE, true);

  console.log("✅ Native contracts deployed and configured successfully!");
}

async function deployMirrorContracts() {
  console.log("📦 Deploying mirror contracts...");

  const SEPOLIA = 16015286601757825753n;
  
  // Get chain-specific addresses
  const { router, linkToken } = await getChainAddresses();
  
  // Deploy CirvaReputationMirror
  console.log("Deploying CirvaReputationMirror...");
  const CirvaReputationMirrorFactory = await ethers.getContractFactory("CirvaReputationMirror");
  const mirrorContract = await CirvaReputationMirrorFactory.deploy(
    router,
    linkToken
  );
  await mirrorContract.waitForDeployment();
  const mirrorAddress = await mirrorContract.getAddress();
  console.log("CirvaReputationMirror deployed at:", mirrorAddress);

  // Configure trusted source chain (Sepolia)
  console.log("Configuring trusted source chain...");
  await mirrorContract.setTrustedSourceChain(SEPOLIA, true);

  console.log("✅ Mirror contract deployed and configured successfully!");
}

async function getChainAddresses(): Promise<{ router: string; linkToken: string }> {
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  switch (chainId) {
    case 80001n: // Mumbai (Polygon testnet)
      return {
        router: "0x70499c328e1E2a3c41108bd3730F6670a44595D1",
        linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
      };
    case 11155420n: // Sepolia Optimism
      return {
        router: "0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7",
        linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789"
      };
    case 421614n: // Sepolia Arbitrum
      return {
        router: "0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7",
        linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789"
      };
    case 84532n: // Sepolia Base
      return {
        router: "0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7",
        linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789"
      };
    default:
      throw new Error(`Unsupported testnet chain ID: ${chainId}`);
  }
}

// Handle errors
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 