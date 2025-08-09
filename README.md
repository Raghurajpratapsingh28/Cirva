# 🌟 CIRVA - Web3 Identity & Reputation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-13.5.1-blueviolet)](https://nextjs.org/)
[![Chainlink CCIP](https://img.shields.io/badge/Chainlink-CCIP-blue)](https://docs.chain.link/ccip)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.25.0-yellow)](https://hardhat.org/)

> **Build Your Web3 Reputation** - Aggregate your onchain and offchain activities into a unified, cross-chain identity with verifiable reputation scores and soulbound achievements.

CIRVA is a comprehensive Web3 identity and reputation management platform that leverages **Chainlink CCIP** for cross-chain synchronization, **AI-powered scoring algorithms**, and **OAuth 2.0** for secure platform verification.

![Cirva Dashboard](https://via.placeholder.com/800x400/6366f1/ffffff?text=Cirva+Dashboard)

## 🚀 Key Features

### 🔗 Cross-Chain Reputation Synchronization
- **Chainlink CCIP Integration**: Seamlessly sync reputation across 15+ blockchain networks
- **Multi-Chain Support**: Ethereum, Polygon, Arbitrum, Optimism, Base, and more
- **Real-time Updates**: Instant cross-chain reputation propagation
- **Gas-Optimized**: Efficient CCIP messaging with minimal transaction costs

### 🏆 Multi-Dimensional Scoring System
- **Developer Score** (0-1000): GitHub contributions, code quality, repository activity
- **Social Score** (0-1000): Twitter engagement, follower count, content quality
- **Community Score** (0-1000): Discord activity, server participation, community building
- **DeFi Score** (0-1000): On-chain activity, protocol interactions, portfolio analysis
- **Overall Reputation** (0-1000): Weighted aggregate of all scores

### 🛡️ Enterprise-Grade Security
- **OAuth 2.0 Authentication**: Secure platform verification without credential storage
- **Zero-Knowledge Proofs**: Privacy-preserving verification mechanisms
- **IPFS Integration**: Decentralized storage for profile data and achievements
- **Smart Contract Security**: Audited contracts with emergency pause mechanisms

### 🎖️ Badge & Achievement System
- **Platform Badges**: Verification achievements for connected platforms
- **Score Badges**: Tier-based recognition (Newcomer → Legend)
- **Rating Badges**: Star-based system (1-5 stars per category)
- **Special Achievements**: Unique milestones and accomplishments

## 🏗️ Architecture Overview

### 📁 Project Structure
```
Cirva/
├── contracts/              # Smart contracts
│   ├── CirvaReputation.sol  # Main reputation contract
│   ├── CirvaDataRequestHandler.sol
│   ├── CirvaReputationMirror.sol
│   └── scorer/             # Chainlink Functions contracts
├── website/                # Next.js frontend application
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── lib/               # Utility libraries
│   ├── hooks/             # Custom React hooks
│   └── prisma/            # Database schema and migrations
├── scripts/               # Deployment scripts
└── docs/                 # Documentation
```

### 🔧 Tech Stack

#### Frontend
- **Framework**: Next.js 13.5.1 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Web3**: Wagmi + RainbowKit + Viem
- **State Management**: React Query (TanStack Query)

#### Backend
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: OAuth 2.0 (GitHub, Twitter, Discord)
- **APIs**: RESTful endpoints for all platform integrations
- **Storage**: IPFS for decentralized data persistence

#### Blockchain
- **Smart Contracts**: Solidity 0.8.19
- **Development**: Hardhat framework
- **Cross-Chain**: Chainlink CCIP
- **Networks**: Sepolia, Mumbai, Arbitrum Sepolia, Optimism Sepolia, Base Sepolia

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Wallet with testnet funds (for contract deployment)
- API keys for GitHub, Twitter, Discord OAuth

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/cirva.git
cd cirva
```

### 2. Install Dependencies
```bash
# Root dependencies (Hardhat)
npm install

# Frontend dependencies
cd website
npm install
cd ..
```

### 3. Environment Configuration

#### Smart Contracts (.env)
```bash
PRIVATE_KEY="your_private_key_here"
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/your-key"
MUMBAI_RPC_URL="https://polygon-mumbai.infura.io/v3/your-key"
ETHERSCAN_API_KEY="your_etherscan_api_key"
POLYGONSCAN_API_KEY="your_polygonscan_api_key"
```

#### Frontend (website/.env.local)
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cirva"

# OAuth Configuration
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# Twitter OAuth
TWITTER_CLIENT_ID="your_twitter_client_id"
TWITTER_CLIENT_SECRET="your_twitter_client_secret"

# Discord OAuth
DISCORD_CLIENT_ID="your_discord_client_id"
DISCORD_CLIENT_SECRET="your_discord_client_secret"

# Blockchain Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your_walletconnect_project_id"
```

### 4. Database Setup
```bash
cd website

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 5. Smart Contract Deployment

#### Deploy to Sepolia (Native Chain)
```bash
export PRIVATE_KEY="your_private_key"
export RPC_URL="https://sepolia.infura.io/v3/your-key"

npx hardhat run scripts/deploy-ccip.ts --network sepolia
```

#### Deploy Mirror Contracts
```bash
# Mumbai
npx hardhat run scripts/deploy-ccip.ts --network mumbai

# Arbitrum Sepolia
npx hardhat run scripts/deploy-ccip.ts --network sepoliaArbitrum

# Optimism Sepolia
npx hardhat run scripts/deploy-ccip.ts --network sepoliaOptimism

# Base Sepolia
npx hardhat run scripts/deploy-ccip.ts --network sepoliaBase
```

### 6. Start Development Server
```bash
cd website
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📖 Usage Guide

### 🔌 Connecting Your Wallet
1. Click "Connect Wallet" on the homepage
2. Select your preferred wallet (MetaMask, Coinbase, WalletConnect)
3. Approve the connection request
4. Access your dashboard at `/dashboard`

### ✅ Platform Verification

#### GitHub Integration
1. Navigate to `/verify`
2. Click "Connect GitHub"
3. Authorize OAuth permissions
4. Your repositories and contributions will be analyzed
5. Developer score calculated automatically

#### Twitter Integration
1. Click "Connect Twitter" in verification flow
2. Authorize application access
3. Social metrics analyzed (followers, engagement, content)
4. Social score updated in real-time

#### Discord Integration
1. Connect Discord account via OAuth
2. Authorize server access permissions
3. Community activity and engagement tracked
4. Community score reflects participation level

### 📊 Understanding Your Scores

#### Developer Score Factors
- **Repository Quality**: Code complexity, documentation, stars
- **Contribution Frequency**: Commit history, pull requests, issues
- **Community Impact**: Forks, collaborators, project popularity
- **Technology Diversity**: Programming languages, frameworks used

#### Social Score Factors
- **Engagement Rate**: Likes, retweets, replies per post
- **Follower Quality**: Follower-to-following ratio, engagement
- **Content Quality**: Tweet sentiment, tech-related content
- **Network Growth**: Follower growth rate, mention frequency

#### Community Score Factors
- **Server Participation**: Message frequency, reaction usage
- **Channel Diversity**: Activity across different channels
- **Community Building**: Server invites, member onboarding
- **Moderation Quality**: Positive community interactions

### 🌐 Cross-Chain Synchronization

1. **View Sync Status**: Dashboard shows chain-specific sync status
2. **Manual Sync**: Click "Sync Chains" to update all networks
3. **Automatic Updates**: Scores sync automatically on significant changes
4. **CCIP Demo**: Test cross-chain messaging in dedicated demo section

## 🔧 API Reference

### User Endpoints

#### Get User Dashboard Data
```http
GET /api/user/dashboard?publicKey=0x...
```
**Response:**
```json
{
  "user": {
    "publicKey": "0x...",
    "githubUsername": "username",
    "isVerifiedGithub": true,
    "discordData": { ... }
  },
  "scores": {
    "database": { "dev": 850, "social": 720, ... },
    "blockchain": { "dev": 850, "social": null, ... },
    "overall": 786
  },
  "ratings": {
    "dev": 4.2,
    "social": 3.8,
    "community": 4.0,
    "defi": 3.5,
    "overall": 4.0
  },
  "badges": {
    "totalBadges": 12,
    "breakdown": { ... },
    "badges": { ... }
  },
  "syncStatus": {
    "needsSync": false,
    "details": { ... }
  }
}
```

#### Update Developer Score
```http
POST /api/user/devscore
Content-Type: application/json

{
  "publicKey": "0x...",
  "devScore": 850,
  "source": "github_analysis"
}
```

#### Sync from Blockchain
```http
PUT /api/user/devscore?publicKey=0x...
```

### Authentication Endpoints

#### GitHub OAuth Callback
```http
GET /api/auth/github/callback?code=...
```

#### Discord OAuth Callback
```http
GET /api/auth/discord/callback?code=...
```

#### Twitter OAuth Callback
```http
GET /api/auth/twitter/callback?code=...
```

## 🔒 Smart Contract Architecture

### Core Contracts

#### CirvaReputation.sol
**Purpose**: Main reputation storage and cross-chain messaging

**Key Features**:
- Stores complete `ReputationData` with detailed scoring
- Handles CCIP cross-chain synchronization
- Manages platform verification status
- Provides reputation querying functions

**Important Functions**:
```solidity
function updateReputation(
    address user,
    uint256 overallScore,
    uint256 developerScore,
    uint256 contributorScore,
    uint256 socialScore,
    uint256 defiScore,
    string calldata ipfsHash,
    Reputation calldata reputation
) external onlyOwner

function syncToChain(
    address user,
    uint64 destinationChainSelector
) external

function getUserReputationStruct(address user) 
    external view returns (Reputation memory)
```

#### CirvaDataRequestHandler.sol
**Purpose**: Handles on-demand data requests from mirror contracts

**Key Features**:
- Processes cross-chain data requests
- Validates trusted request chains
- Returns comprehensive reputation data
- Manages request/response lifecycle

#### CirvaReputationMirror.sol
**Purpose**: Lightweight reputation mirrors on destination chains

**Key Features**:
- Stores minimal reputation data
- Receives CCIP updates from native chain
- Provides local reputation queries
- Optimized for gas efficiency

### Reputation Data Structure
```solidity
struct Reputation {
    uint256 reputationScore;    // Overall score (0-1000)
    uint16 devRating;           // Developer rating (0-100)
    uint16 communityRating;     // Community rating (0-100)
    uint16 socialRating;        // Social rating (0-100)
    uint16 defiRating;          // DeFi rating (0-100)
    string overallRating;       // Human-readable rating
}

struct ReputationData {
    uint256 overallScore;
    uint256 developerScore;
    uint256 contributorScore;
    uint256 socialScore;
    uint256 defiScore;
    uint256 lastUpdated;
    string ipfsHash;
    bool isActive;
    Reputation reputation;
}
```

### Supported Networks

| Network | Chain ID | Chain Selector | Type | Status |
|---------|----------|----------------|------|--------|
| Sepolia | 11155111 | 16015286601757825753 | Native | ✅ Active |
| Mumbai | 80001 | 12532609583862916517 | Mirror | ✅ Active |
| Arbitrum Sepolia | 421614 | 4949039107694359620 | Mirror | ✅ Active |
| Optimism Sepolia | 11155420 | 2664363617261496610 | Mirror | ✅ Active |
| Base Sepolia | 84532 | 15971525489660198786 | Mirror | ✅ Active |

## 🧪 Testing

### Smart Contract Testing
```bash
# Run all contract tests
npx hardhat test

# Run specific test file
npx hardhat test test/CirvaReputation.test.ts

# Generate coverage report
npx hardhat coverage
```

### Frontend Testing
```bash
cd website

# Run component tests
npm run test

# Run E2E tests
npm run test:e2e

# Test OAuth flows
node test-oauth-config.js
```

### API Testing
```bash
# Test dashboard API
node test-dashboard-api.js

# Test DevScore integration
node test-devscore-api.js

# Test Discord OAuth
node test-discord-oauth.js
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd website
npm run build

# Start production server
npm run start
```

### Environment Setup

#### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

#### Database Migration
```bash
# Production migration
npx prisma migrate deploy

# Generate production client
npx prisma generate
```

### Smart Contract Verification
```bash
# Verify on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS

# Verify on Polygonscan
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

## 🔧 Configuration

### OAuth Setup Guides

#### GitHub OAuth App
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App with:
   - Application name: "Cirva"
   - Homepage URL: `https://your-domain.com`
   - Callback URL: `https://your-domain.com/api/auth/github/callback`
3. Copy Client ID and Client Secret

#### Twitter OAuth App
1. Create Twitter Developer Account
2. Create new App in Twitter Developer Portal
3. Configure OAuth 2.0 settings:
   - Callback URL: `https://your-domain.com/api/auth/twitter/callback`
   - Website URL: `https://your-domain.com`
4. Generate Client ID and Client Secret

#### Discord OAuth App
1. Go to Discord Developer Portal
2. Create New Application
3. Navigate to OAuth2 settings
4. Add redirect URL: `https://your-domain.com/api/auth/discord/callback`
5. Copy Client ID and Client Secret

### Chain Configuration

#### Adding New Chain Support
1. Update `hardhat.config.ts` with new network configuration
2. Deploy mirror contract to new chain
3. Update chain selectors in smart contracts
4. Add network configuration to frontend
5. Test cross-chain messaging

## 🤝 Contributing

We welcome contributions to Cirva! Please follow these guidelines:

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style
- **Frontend**: ESLint + Prettier configuration
- **Smart Contracts**: Solidity style guide
- **TypeScript**: Strict mode enabled
- **Commit Messages**: Conventional commits format

### Testing Requirements
- Unit tests for all new functions
- Integration tests for API endpoints
- Contract tests for smart contract changes
- E2E tests for critical user flows

## 📚 Documentation

### Additional Resources
- [CCIP Architecture Guide](./CCIP_ARCHITECTURE.md) - Detailed cross-chain implementation
- [API Documentation](./website/DASHBOARD_API.md) - Complete API reference
- [OAuth Setup Guides](./website/DISCORD_OAUTH_SETUP.md) - Platform integration guides
- [DevScore Integration](./website/GETDEVSCORE_INTEGRATION.md) - GitHub scoring system
- [Social Score Backend](./website/SOCIAL_SCORE_BACKEND.md) - Twitter integration details

### Video Tutorials
- [Getting Started with Cirva](https://youtube.com/watch?v=example)
- [Setting up Cross-Chain Sync](https://youtube.com/watch?v=example)
- [Platform Verification Guide](https://youtube.com/watch?v=example)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chainlink**: For providing robust CCIP infrastructure
- **Vercel**: For seamless deployment and hosting
- **OpenZeppelin**: For security-audited smart contract libraries
- **Prisma**: For excellent database ORM
- **shadcn/ui**: For beautiful, accessible UI components

## 📞 Support & Community

- **Discord**: [Join our community](https://discord.gg/cirva)
- **Twitter**: [@CirvaProtocol](https://twitter.com/CirvaProtocol)
- **Documentation**: [docs.cirva.xyz](https://docs.cirva.xyz)
- **Email**: support@cirva.xyz

---

**Built with ❤️ by the Cirva Team**

*Empowering the future of Web3 identity and reputation management.*
