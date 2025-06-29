# GetDevScore Integration

This document explains the integration of the GetDevScore smart contract with the CIRVA Web3 Identity platform.

## Overview

The GetDevScore integration allows users to calculate their developer score based on GitHub activity using Chainlink Functions. The score is calculated on-chain and stored in a smart contract deployed on the Sepolia testnet.

## Smart Contract Details

- **Contract Address**: `0x9103650b6Cd763F00458D634D55f4FE15A2d328e` (Sepolia)
- **Subscription ID**: `5186`
- **Network**: Sepolia Testnet
- **Function**: `sendRequest(uint64 subscriptionId, string[] calldata args)`

## How It Works

1. **User Input**: User enters their GitHub username
2. **Smart Contract Call**: The frontend calls the `sendRequest` function with:
   - `subscriptionId = 5186`
   - `args[0] = GitHub username`
3. **Chainlink Functions**: The contract triggers a Chainlink Function that:
   - Fetches GitHub profile data (followers, public repos)
   - Fetches GitHub events (commits, PRs, issues)
   - Calculates a developer score based on activity
4. **Score Calculation**: The score is calculated using:
   - Followers × 0.3
   - Public repos × 0.2
   - Commits × 0.2
   - Pull requests × 0.2
   - Issues × 0.1
5. **On-chain Storage**: The calculated score is stored on-chain and mapped to the user's wallet address

## Frontend Integration

### Components

1. **DevScoreButton** (`components/DevScoreButton.tsx`)
   - Main UI component for interacting with the smart contract
   - Handles wallet connection, network validation, and transaction status
   - Shows loading states, transaction hashes, and calculated scores

2. **useDevScore Hook** (`hooks/useDevScore.ts`)
   - Custom React hook for smart contract interactions
   - Manages state (loading, score, error, transaction hash)
   - Handles transaction confirmation and score polling

3. **Smart Contract Utilities** (`lib/contracts/devScore.ts`)
   - Contract ABI and address definitions
   - Functions for reading and writing to the smart contract
   - Public client configuration for Sepolia

### Integration Points

1. **Verification Page** (`app/verify/page.tsx`)
   - DevScoreButton is integrated after the platform verification grid
   - Automatically uses the GitHub username if the user has verified GitHub

2. **Dashboard Page** (`app/dashboard/page.tsx`)
   - DevScoreButton is integrated in the main dashboard
   - Updates the mock user profile when a score is calculated

## Usage Flow

1. **Connect Wallet**: User must connect their wallet
2. **Switch Network**: User must be on Sepolia testnet
3. **Enter GitHub Username**: User enters their GitHub username
4. **Submit Transaction**: User approves the transaction (requires gas fees)
5. **Wait for Calculation**: Chainlink Functions processes the request
6. **View Score**: The calculated score is displayed and stored on-chain

## Technical Requirements

- **Wallet**: MetaMask or any Web3 wallet
- **Network**: Sepolia testnet
- **Gas Fees**: User pays for transaction gas
- **GitHub Username**: Valid GitHub username

## Error Handling

- **Network Validation**: Ensures user is on Sepolia testnet
- **Wallet Connection**: Validates wallet is connected
- **Transaction Errors**: Handles failed transactions gracefully
- **Score Polling**: Times out after 5 minutes if score calculation fails

## Security Features

- **OAuth Integration**: Uses existing GitHub OAuth for username validation
- **Wallet Verification**: Only the connected wallet can request scores
- **On-chain Storage**: Scores are stored securely on the blockchain
- **Chainlink Functions**: Secure off-chain computation with on-chain verification

## Future Enhancements

- **Score History**: Track score changes over time
- **Multiple Networks**: Deploy to mainnet and other networks
- **Score Comparison**: Compare scores across users
- **Badge Integration**: Award badges based on score thresholds
- **Automated Updates**: Periodic score recalculation

## Testing

To test the integration:

1. Start the development server: `npm run dev`
2. Navigate to `/verify` or `/dashboard`
3. Connect your wallet and switch to Sepolia testnet
4. Enter a valid GitHub username
5. Approve the transaction
6. Wait for score calculation (may take 1-2 minutes)

## Contract Verification

The smart contract is verified on Sepolia Etherscan:
https://sepolia.etherscan.io/address/0x9103650b6Cd763F00458D634D55f4FE15A2d328e 