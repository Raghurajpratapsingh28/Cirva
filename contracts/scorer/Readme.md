# 📊 Onchain Score System

This project implements a modular scoring system using Chainlink Functions and external APIs to calculate different metrics for a blockchain user. Each score is derived from a specific category, and all contracts are deployed on the **Sepolia Testnet**.

---

## 🔗 Smart Contract Addresses (Sepolia)

| Contract Type      | Description                              | Address |
|--------------------|------------------------------------------|---------|
| 🧑‍💻 Dev Score        | Measures coding contributions on GitHub     | [`0x9103650b6Cd763F00458D634D55f4FE15A2d328e`](https://sepolia.etherscan.io/address/0x9103650b6Cd763F00458D634D55f4FE15A2d328e) |
| 👥 Community Score | Scores based on Discord presence & tenure | [`0x9847bEca9D483707261Cbd70263B091eFafeAdc4`](https://sepolia.etherscan.io/address/0xe74dbEad9f5c5964832B4F1898d7ddd28222DD2b) |
| 📱 Social Score     | Scores based on GitHub, Twitter, Discord | [`0xfA145E64eee885Db2190580B1bF2C9373a6D78CA`](https://sepolia.etherscan.io/address/0xfA145E64eee885Db2190580B1bF2C9373a6D78CA) |
| 🏦 DeFi Score       | Evaluates wallet's DeFi/NFT/Builder data | [`0x5593b14639b27cdcc9e75e0e6ba4ab2319aa15f9`](https://sepolia.etherscan.io/address/0x4c00fbd73852db0e2af153261bc41d101f5858c9) |

---

## ⚙️ How It Works

Each contract uses **Chainlink Functions** to make off-chain HTTP requests and return relevant data on-chain. 

**Workflow:**
1. Chainlink Functions makes a request to an API (GitHub, Discord, Covalent, etc.)
2. Score is computed in JavaScript and returned to the smart contract
3. Result is decoded and stored on-chain, mapped to user's address

---

## 📁 Contract Descriptions

### 🧑‍💻 Dev Score (`DevScore.sol`)
- Uses **GitHub API**
- Measures:
  - Followers
  - Public Repositories
  - Recent Pull Requests, Issues, Commits
- Returns a normalized developer score

---

### 👥 Community Score (`CommunityScore.sol`)
- Uses **Discord API**
- Measures:
  - Avatar Presence
  - Nickname Presence
  - Discord Badges (Public Flags)
  - Role Count
  - Tenure (Days in Server)
  - OG Member Bonus
- Returns total + all individual scores

---

### 📱 Social Score (`SocialScore.sol`)
- Uses **multiple APIs** (GitHub, Twitter, Discord)
- Measures:
  - Social presence & reputation
  - Engagement across platforms
- Designed for **future extensibility**

---

### 🏦 DeFi Score (`DeFiScore.sol`)
- Uses **Covalent API**
- Measures:
  - Number of DeFi protocols interacted with
  - Number of NFTs held
  - Number of smart contracts deployed
- Each metric is capped and combined for a 0-300 score

---
