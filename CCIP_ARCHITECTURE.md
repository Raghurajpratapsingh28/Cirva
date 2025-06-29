# CIRVA CCIP Architecture Documentation (Testnet Version)

## 🚀 Overview

CIRVA uses Chainlink CCIP for cross-chain reputation synchronization with a new Reputation struct on testnet networks:

```solidity
struct Reputation {
    uint256 reputationScore;    // Overall reputation score (0-1000)
    uint16 devRating;           // Developer rating (0-100)
    uint16 communityRating;     // Community rating (0-100)
    uint16 socialRating;        // Social rating (0-100)
    uint16 defiRating;          // DeFi rating (0-100)
    string overallRating;       // Human-readable rating
}
```

## 📊 Contract Structure

### CirvaReputation.sol (Native Contract)
- Stores complete reputation data with Reputation struct on Sepolia
- Handles CCIP messaging to other testnet chains
- Functions: `updateReputation()`, `syncToChain()`, `getUserReputationStruct()`

### CirvaReputationMirror.sol (Mirror Contract)
- Stores minimal data on destination testnet chains
- Receives reputation updates via CCIP
- Functions: `getReputation()`, `getUserReputationStruct()`

### CirvaDataRequestHandler.sol (Request Handler)
- Handles on-demand data requests from mirror contracts
- Processes requests and sends responses back

## 🌐 Supported Testnet Networks

| Network | Chain ID | Chain Selector | Contract Type | Router Address |
|---------|----------|----------------|---------------|----------------|
| Sepolia | 11155111 | 16015286601757825753 | Native | 0xD0daae2231E9CB96b94C8512223533293C3693Bf |
| Mumbai | 80001 | 12532609583862916517 | Mirror | 0x70499c328e1E2a3c41108bd3730F6670a44595D1 |
| Sepolia Optimism | 11155420 | 2664363617261496610 | Mirror | 0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7 |
| Sepolia Arbitrum | 421614 | 4949039107694359620 | Mirror | 0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7 |
| Sepolia Base | 84532 | 15971525489660198786 | Mirror | 0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7 |

## 🚀 Deployment Process

### 1. Deploy Native Contract (Sepolia)
```bash
# Set environment variables
export PRIVATE_KEY="your_private_key"
export RPC_URL="https://sepolia.infura.io/v3/your_key"

# Deploy contracts
forge script DeployCirvaCCIP --rpc-url $RPC_URL --broadcast --verify
```

### 2. Deploy Mirror Contracts (Other Testnets)
```bash
# Deploy on Mumbai
forge script DeployCirvaCCIP --rpc-url https://polygon-mumbai.infura.io/v3/your-key --broadcast --verify

# Deploy on Sepolia Optimism
forge script DeployCirvaCCIP --rpc-url https://sepolia.optimism.io --broadcast --verify

# Deploy on Sepolia Arbitrum
forge script DeployCirvaCCIP --rpc-url https://sepolia-rollup.arbitrum.io/rpc --broadcast --verify

# Deploy on Sepolia Base
forge script DeployCirvaCCIP --rpc-url https://sepolia.base.org --broadcast --verify
```

### 3. Configure Cross-Chain Trust
```solidity
// On native contract (Sepolia)
reputationContract.setChainSupport(MUMBAI, true);
reputationContract.setChainSupport(SEPOLIA_OPTIMISM, true);
reputationContract.setChainSupport(SEPOLIA_ARBITRUM, true);
reputationContract.setChainSupport(SEPOLIA_BASE, true);

// On data request handler
requestHandler.setTrustedRequestChain(MUMBAI, true);
requestHandler.setTrustedRequestChain(SEPOLIA_OPTIMISM, true);
requestHandler.setTrustedRequestChain(SEPOLIA_ARBITRUM, true);
requestHandler.setTrustedRequestChain(SEPOLIA_BASE, true);

// On mirror contracts
mirrorContract.setTrustedSourceChain(SEPOLIA, true);
```

## 🔒 Security Features

- Access control with owner functions
- Chain validation for CCIP messages
- Emergency pause mechanisms
- Gas-optimized operations

## 📋 Contract Functions

- `updateReputation()` - Update reputation with the new struct
- `getUserReputationStruct()` - Get specific reputation data
- `syncToChain()` - Cross-chain synchronization
- `getReputation()` - Retrieve complete reputation data

## 🎨 Frontend Integration

### CCIP Manager Class
```typescript
const ccipManager = new CirvaCCIPManager(provider, signer);

// Get reputation data
const reputation = await ccipManager.getReputationData(userAddress);

// Sync to another testnet
await ccipManager.syncToChain(userAddress, CHAIN_SELECTORS.MUMBAI);

// Get sync status
const syncStatus = await ccipManager.getSyncStatus(userAddress);
```

## 🧪 Testing Strategy

### Unit Tests
- Contract function testing
- CCIP message encoding/decoding
- Access control validation
- Error handling scenarios
- Reputation struct validation

### Integration Tests
- Cross-chain message flow
- End-to-end sync operations
- Gas usage optimization
- Security vulnerability testing

### Testnet Deployment
- Sepolia testnet for initial testing
- Cross-chain message validation
- Performance benchmarking
- User acceptance testing

## 📚 Additional Resources

- [Chainlink CCIP Documentation](https://docs.chain.link/ccip)
- [CCIP Best Practices](https://docs.chain.link/ccip/best-practices)
- [Cross-Chain Security](https://docs.chain.link/ccip/security-considerations)
- [Gas Optimization Guide](https://docs.chain.link/ccip/gas-optimization)

---

This architecture provides a robust, scalable, and gas-efficient solution for cross-chain reputation data synchronization using Chainlink CCIP on testnet networks, with the new Reputation struct providing detailed user ratings across multiple dimensions. 