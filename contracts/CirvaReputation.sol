// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CirvaReputation
 * @notice Main contract for storing and syncing reputation data across chains
 * @dev Uses Chainlink CCIP for cross-chain communication (Testnet Version)
 */
contract CirvaReputation is CCIPReceiver, Ownable, ReentrancyGuard, Pausable {
    
    // ============ STRUCTS ============
    
    struct Reputation {
        uint256 reputationScore;
        uint16 devRating;
        uint16 communityRating;
        uint16 socialRating;
        uint16 defiRating;
        string overallRating;
    }
    
    struct ReputationData {
        uint256 overallScore;
        uint256 developerScore;
        uint256 contributorScore;
        uint256 socialScore;
        uint256 defiScore;
        uint256 lastUpdated;
        string ipfsHash; // IPFS hash for detailed profile data
        bool isActive;
        Reputation reputation; // New reputation struct
    }
    
    struct VerificationData {
        bool githubVerified;
        bool twitterVerified;
        bool discordVerified;
        string githubUsername;
        string twitterUsername;
        string discordUsername;
        uint256 verificationTimestamp;
    }
    
    struct CrossChainMessage {
        address userAddress;
        uint256 overallScore;
        uint256 lastUpdated;
        string ipfsHash;
        uint64 destinationChainSelector;
        bool isUpdate;
        Reputation reputation; // Include reputation in cross-chain messages
    }
    
    // ============ STATE VARIABLES ============
    
    IRouterClient public router;
    IERC20 public linkToken;
    
    // User reputation mapping
    mapping(address => ReputationData) public userReputations;
    mapping(address => VerificationData) public userVerifications;
    
    // Cross-chain sync tracking
    mapping(address => mapping(uint64 => uint256)) public lastSyncTimestamp;
    mapping(uint64 => bool) public supportedChains;
    
    // Events
    event ReputationUpdated(address indexed user, uint256 overallScore, string ipfsHash);
    event VerificationUpdated(address indexed user, string platform, bool verified);
    event CrossChainSyncInitiated(address indexed user, uint64 destinationChain, uint256 messageId);
    event CrossChainSyncReceived(address indexed user, uint64 sourceChain, uint256 overallScore);
    event ChainSupported(uint64 chainSelector, bool supported);
    
    // ============ ERRORS ============
    
    error UnsupportedChain(uint64 chainSelector);
    error InvalidReputationScore(uint256 score);
    error UserNotVerified(address user);
    error CrossChainSyncFailed(uint256 messageId);
    error InsufficientLinkBalance(uint256 required, uint256 available);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _router,
        address _linkToken
    ) CCIPReceiver(_router) {
        router = IRouterClient(_router);
        linkToken = IERC20(_linkToken);
    }
    
    // ============ MODIFIERS ============
    
    modifier onlySupportedChain(uint64 chainSelector) {
        if (!supportedChains[chainSelector]) {
            revert UnsupportedChain(chainSelector);
        }
        _;
    }
    
    modifier validReputationScore(uint256 score) {
        if (score > 1000) {
            revert InvalidReputationScore(score);
        }
        _;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Update user reputation data with the new Reputation struct
     * @param user Address of the user
     * @param overallScore Overall reputation score (0-1000)
     * @param developerScore Developer reputation score (0-1000)
     * @param contributorScore Contributor reputation score (0-1000)
     * @param socialScore Social reputation score (0-1000)
     * @param defiScore DeFi reputation score (0-1000)
     * @param ipfsHash IPFS hash containing detailed profile data
     * @param reputation Reputation struct with detailed ratings
     */
    function updateReputation(
        address user,
        uint256 overallScore,
        uint256 developerScore,
        uint256 contributorScore,
        uint256 socialScore,
        uint256 defiScore,
        string calldata ipfsHash,
        Reputation calldata reputation
    ) external onlyOwner validReputationScore(overallScore) {
        ReputationData storage reputationData = userReputations[user];
        
        reputationData.overallScore = overallScore;
        reputationData.developerScore = developerScore;
        reputationData.contributorScore = contributorScore;
        reputationData.socialScore = socialScore;
        reputationData.defiScore = defiScore;
        reputationData.lastUpdated = block.timestamp;
        reputationData.ipfsHash = ipfsHash;
        reputationData.isActive = true;
        reputationData.reputation = reputation; // Store the new reputation struct
        
        emit ReputationUpdated(user, overallScore, ipfsHash);
    }
    
    /**
     * @notice Update user verification status
     * @param user Address of the user
     * @param platform Platform name (github, twitter, discord)
     * @param verified Verification status
     * @param username Username on the platform
     */
    function updateVerification(
        address user,
        string calldata platform,
        bool verified,
        string calldata username
    ) external onlyOwner {
        VerificationData storage verification = userVerifications[user];
        
        if (keccak256(bytes(platform)) == keccak256(bytes("github"))) {
            verification.githubVerified = verified;
            verification.githubUsername = username;
        } else if (keccak256(bytes(platform)) == keccak256(bytes("twitter"))) {
            verification.twitterVerified = verified;
            verification.twitterUsername = username;
        } else if (keccak256(bytes(platform)) == keccak256(bytes("discord"))) {
            verification.discordVerified = verified;
            verification.discordUsername = username;
        }
        
        verification.verificationTimestamp = block.timestamp;
        
        emit VerificationUpdated(user, platform, verified);
    }
    
    // ============ CROSS-CHAIN FUNCTIONS ============
    
    /**
     * @notice Sync reputation data to another chain
     * @param user Address of the user
     * @param destinationChainSelector Chain selector for destination chain
     */
    function syncToChain(
        address user,
        uint64 destinationChainSelector
    ) external onlySupportedChain(destinationChainSelector) nonReentrant whenNotPaused {
        ReputationData storage reputation = userReputations[user];
        
        if (!reputation.isActive) {
            revert UserNotVerified(user);
        }
        
        // Create message data with reputation struct
        CrossChainMessage memory message = CrossChainMessage({
            userAddress: user,
            overallScore: reputation.overallScore,
            lastUpdated: reputation.lastUpdated,
            ipfsHash: reputation.ipfsHash,
            destinationChainSelector: destinationChainSelector,
            isUpdate: true,
            reputation: reputation.reputation // Include reputation struct
        });
        
        // Encode message
        bytes memory encodedMessage = abi.encode(message);
        
        // Create CCIP message
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(address(this)),
            data: encodedMessage,
            tokenAmounts: new Client.TokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            ),
            feeToken: address(linkToken)
        });
        
        // Get fee
        uint256 fees = router.getFee(destinationChainSelector, evm2AnyMessage);
        
        // Check LINK balance
        if (linkToken.balanceOf(address(this)) < fees) {
            revert InsufficientLinkBalance(fees, linkToken.balanceOf(address(this)));
        }
        
        // Approve LINK spending
        linkToken.approve(address(router), fees);
        
        // Send message
        bytes32 messageId = router.ccipSend(destinationChainSelector, evm2AnyMessage);
        
        // Update sync timestamp
        lastSyncTimestamp[user][destinationChainSelector] = block.timestamp;
        
        emit CrossChainSyncInitiated(user, destinationChainSelector, uint256(messageId));
    }
    
    /**
     * @notice Handle incoming CCIP messages from other chains
     * @param message CCIP message data
     */
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        CrossChainMessage memory receivedMessage = abi.decode(message.data, (CrossChainMessage));
        
        // Update local reputation data including the reputation struct
        ReputationData storage reputation = userReputations[receivedMessage.userAddress];
        reputation.overallScore = receivedMessage.overallScore;
        reputation.lastUpdated = receivedMessage.lastUpdated;
        reputation.ipfsHash = receivedMessage.ipfsHash;
        reputation.isActive = true;
        reputation.reputation = receivedMessage.reputation; // Update reputation struct
        
        // Update sync timestamp
        lastSyncTimestamp[receivedMessage.userAddress][message.sourceChainSelector] = block.timestamp;
        
        emit CrossChainSyncReceived(
            receivedMessage.userAddress,
            message.sourceChainSelector,
            receivedMessage.overallScore
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get user reputation data
     * @param user Address of the user
     * @return reputation Reputation data struct
     */
    function getReputation(address user) external view returns (ReputationData memory reputation) {
        return userReputations[user];
    }
    
    /**
     * @notice Get user verification data
     * @param user Address of the user
     * @return verification Verification data struct
     */
    function getVerification(address user) external view returns (VerificationData memory verification) {
        return userVerifications[user];
    }
    
    /**
     * @notice Get user's Reputation struct specifically
     * @param user Address of the user
     * @return reputation The Reputation struct
     */
    function getUserReputationStruct(address user) external view returns (Reputation memory reputation) {
        return userReputations[user].reputation;
    }
    
    /**
     * @notice Get last sync timestamp for a user on a specific chain
     * @param user Address of the user
     * @param chainSelector Chain selector
     * @return timestamp Last sync timestamp
     */
    function getLastSyncTimestamp(address user, uint64 chainSelector) external view returns (uint256 timestamp) {
        return lastSyncTimestamp[user][chainSelector];
    }
    
    /**
     * @notice Check if a chain is supported
     * @param chainSelector Chain selector
     * @return supported Whether the chain is supported
     */
    function isChainSupported(uint64 chainSelector) external view returns (bool supported) {
        return supportedChains[chainSelector];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Add or remove supported chain
     * @param chainSelector Chain selector
     * @param supported Whether to support the chain
     */
    function setChainSupport(uint64 chainSelector, bool supported) external onlyOwner {
        supportedChains[chainSelector] = supported;
        emit ChainSupported(chainSelector, supported);
    }
    
    /**
     * @notice Pause contract operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Withdraw LINK tokens
     * @param amount Amount to withdraw
     */
    function withdrawLink(uint256 amount) external onlyOwner {
        linkToken.transfer(owner(), amount);
    }
    
    /**
     * @notice Emergency withdraw LINK tokens
     */
    function emergencyWithdrawLink() external onlyOwner {
        uint256 balance = linkToken.balanceOf(address(this));
        linkToken.transfer(owner(), balance);
    }
} 