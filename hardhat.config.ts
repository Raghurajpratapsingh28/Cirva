import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Sepolia (Ethereum testnet)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/your-key",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    // Mumbai (Polygon testnet)
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://polygon-mumbai.infura.io/v3/your-key",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
    },
    // Sepolia Optimism
    sepoliaOptimism: {
      url: process.env.SEPOLIA_OPTIMISM_RPC_URL || "https://sepolia.optimism.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155420,
    },
    // Sepolia Arbitrum
    sepoliaArbitrum: {
      url: process.env.SEPOLIA_ARBITRUM_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
    // Sepolia Base
    sepoliaBase: {
      url: process.env.SEPOLIA_BASE_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
    // Local development
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      mumbai: process.env.POLYGONSCAN_API_KEY || "",
      sepoliaOptimism: process.env.OPTIMISM_API_KEY || "",
      sepoliaArbitrum: process.env.ARBISCAN_API_KEY || "",
      sepoliaBase: process.env.BASESCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config; 