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
 * @title CirvaReputationMirror
 * @notice Mirror contract for storing reputation data on destination chains
 * @dev Receives data via CCIP and stores minimal reputation information
 */
contract CirvaReputationMirror is CCIPReceiver, Ownable, ReentrancyGuard, Pausable {
    
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
        uint256 lastUpdated;
        string ipfsHash; // IPFS hash for detailed profile data
        bool isActive;
        uint64 sourceChainSelector; // Chain where data originated
        Reputation reputation; // Include reputation struct
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
    
    // User reputation mapping (minimal data for gas efficiency)
    mapping(address => ReputationData) public userReputations;
    
    // Cross-chain sync tracking
    mapping(address => mapping(uint64 => uint256)) public lastSyncTimestamp;
    mapping(uint64 => bool) public trustedSourceChains;
    
    // Events
    event ReputationReceived(address indexed user, uint256 overallScore, string ipfsHash, uint64 sourceChain);
    event CrossChainSyncInitiated(address indexed user, uint64 destinationChain, uint256 messageId);
    event TrustedSourceChainUpdated(uint64 chainSelector, bool trusted);
    
    // ============ ERRORS ============
    
    error UntrustedSourceChain(uint64 chainSelector);
    error InvalidReputationScore(uint256 score);
    error UserNotActive(address user);
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
    
    modifier onlyTrustedSourceChain(uint64 chainSelector) {
        if (!trustedSourceChains[chainSelector]) {
            revert UntrustedSourceChain(chainSelector);
        }
        _;
    }
    
    modifier validReputationScore(uint256 score) {
        if (score > 1000) {
            revert InvalidReputationScore(score);
        }
        _;
    }
    
    // ============ CROSS-CHAIN FUNCTIONS ============
    
    /**
     * @notice Handle incoming CCIP messages from trusted source chains
     * @param message CCIP message data
     */
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        CrossChainMessage memory receivedMessage = abi.decode(message.data, (CrossChainMessage));
        
        // Update local reputation data including reputation struct
        ReputationData storage reputation = userReputations[receivedMessage.userAddress];
        reputation.overallScore = receivedMessage.overallScore;
        reputation.lastUpdated = receivedMessage.lastUpdated;
        reputation.ipfsHash = receivedMessage.ipfsHash;
        reputation.isActive = true;
        reputation.sourceChainSelector = message.sourceChainSelector;
        reputation.reputation = receivedMessage.reputation; // Store reputation struct
        
        // Update sync timestamp
        lastSyncTimestamp[receivedMessage.userAddress][message.sourceChainSelector] = block.timestamp;
        
        emit ReputationReceived(
            receivedMessage.userAddress,
            receivedMessage.overallScore,
            receivedMessage.ipfsHash,
            message.sourceChainSelector
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get minimal reputation data for a user
     * @param user Address of the user
     * @return reputation Minimal reputation data
     */
    function getReputation(address user) external view returns (ReputationData memory reputation) {
        return userReputations[user];
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
     * @notice Get reputation score with metadata
     * @param user Address of the user
     * @return overallScore Overall reputation score
     * @return lastUpdated Last update timestamp
     * @return ipfsHash IPFS hash for detailed data
     * @return isActive Whether user is active
     * @return sourceChain Chain where data originated
     */
    function getReputationScore(address user) external view returns (
        uint256 overallScore,
        uint256 lastUpdated,
        string memory ipfsHash,
        bool isActive,
        uint64 sourceChain
    ) {
        ReputationData storage reputation = userReputations[user];
        return (
            reputation.overallScore,
            reputation.lastUpdated,
            reputation.ipfsHash,
            reputation.isActive,
            reputation.sourceChainSelector
        );
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
     * @notice Check if a source chain is trusted
     * @param chainSelector Chain selector
     * @return trusted Whether the chain is trusted
     */
    function isTrustedSourceChain(uint64 chainSelector) external view returns (bool trusted) {
        return trustedSourceChains[chainSelector];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Add or remove trusted source chain
     * @param chainSelector Chain selector
     * @param trusted Whether to trust the chain
     */
    function setTrustedSourceChain(uint64 chainSelector, bool trusted) external onlyOwner {
        trustedSourceChains[chainSelector] = trusted;
        emit TrustedSourceChainUpdated(chainSelector, trusted);
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