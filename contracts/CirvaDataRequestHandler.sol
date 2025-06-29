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
 * @title CirvaDataRequestHandler
 * @notice Contract for handling on-demand data requests from mirror contracts
 * @dev Processes requests and sends reputation data back to requesting chains
 */
contract CirvaDataRequestHandler is CCIPReceiver, Ownable, ReentrancyGuard, Pausable {
    
    // ============ STRUCTS ============
    
    struct Reputation {
        uint256 reputationScore;
        uint16 devRating;
        uint16 communityRating;
        uint16 socialRating;
        uint16 defiRating;
        string overallRating;
    }
    
    struct DataRequest {
        address userAddress;
        uint64 sourceChainSelector;
        uint256 requestTimestamp;
    }
    
    struct ReputationResponse {
        address userAddress;
        uint256 overallScore;
        uint256 developerScore;
        uint256 contributorScore;
        uint256 socialScore;
        uint256 defiScore;
        uint256 lastUpdated;
        string ipfsHash;
        bool isActive;
        Reputation reputation; // Include reputation struct
    }
    
    // ============ STATE VARIABLES ============
    
    IRouterClient public router;
    IERC20 public linkToken;
    
    // Reference to the main reputation contract
    address public reputationContract;
    
    // Trusted request chains
    mapping(uint64 => bool) public trustedRequestChains;
    
    // Request tracking
    mapping(bytes32 => DataRequest) public pendingRequests;
    mapping(bytes32 => bool) public processedRequests;
    
    // Events
    event DataRequestReceived(address indexed user, uint64 sourceChain, bytes32 requestId);
    event DataResponseSent(address indexed user, uint64 destinationChain, bytes32 responseId);
    event TrustedRequestChainUpdated(uint64 chainSelector, bool trusted);
    
    // ============ ERRORS ============
    
    error UntrustedRequestChain(uint64 chainSelector);
    error RequestNotFound(bytes32 requestId);
    error RequestAlreadyProcessed(bytes32 requestId);
    error InsufficientLinkBalance(uint256 required, uint256 available);
    error InvalidReputationContract();
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _router,
        address _linkToken,
        address _reputationContract
    ) CCIPReceiver(_router) {
        router = IRouterClient(_router);
        linkToken = IERC20(_linkToken);
        reputationContract = _reputationContract;
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyTrustedRequestChain(uint64 chainSelector) {
        if (!trustedRequestChains[chainSelector]) {
            revert UntrustedRequestChain(chainSelector);
        }
        _;
    }
    
    modifier onlyValidReputationContract() {
        if (reputationContract == address(0)) {
            revert InvalidReputationContract();
        }
        _;
    }
    
    // ============ CROSS-CHAIN FUNCTIONS ============
    
    /**
     * @notice Handle incoming CCIP messages (data requests)
     * @param message CCIP message data
     */
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        DataRequest memory request = abi.decode(message.data, (DataRequest));
        
        // Verify source chain is trusted
        if (!trustedRequestChains[message.sourceChainSelector]) {
            revert UntrustedRequestChain(message.sourceChainSelector);
        }
        
        // Generate request ID
        bytes32 requestId = keccak256(abi.encodePacked(
            request.userAddress,
            message.sourceChainSelector,
            request.requestTimestamp
        ));
        
        // Store request
        pendingRequests[requestId] = request;
        
        emit DataRequestReceived(
            request.userAddress,
            message.sourceChainSelector,
            requestId
        );
        
        // Process the request
        _processDataRequest(requestId, request, message.sourceChainSelector);
    }
    
    /**
     * @notice Process a data request and send response
     * @param requestId Unique request identifier
     * @param request Data request details
     * @param sourceChainSelector Source chain selector
     */
    function _processDataRequest(
        bytes32 requestId,
        DataRequest memory request,
        uint64 sourceChainSelector
    ) internal onlyValidReputationContract {
        
        // Check if already processed
        if (processedRequests[requestId]) {
            revert RequestAlreadyProcessed(requestId);
        }
        
        // Get reputation data from main contract
        (bool success, bytes memory data) = reputationContract.staticcall(
            abi.encodeWithSignature("getReputation(address)", request.userAddress)
        );
        
        if (!success) {
            // Handle case where user doesn't exist
            return;
        }
        
        // Decode reputation data
        (
            uint256 overallScore,
            uint256 developerScore,
            uint256 contributorScore,
            uint256 socialScore,
            uint256 defiScore,
            uint256 lastUpdated,
            string memory ipfsHash,
            bool isActive,
            Reputation memory reputation
        ) = abi.decode(data, (
            uint256, uint256, uint256, uint256, uint256,
            uint256, string, bool, Reputation
        ));
        
        // Create response
        ReputationResponse memory response = ReputationResponse({
            userAddress: request.userAddress,
            overallScore: overallScore,
            developerScore: developerScore,
            contributorScore: contributorScore,
            socialScore: socialScore,
            defiScore: defiScore,
            lastUpdated: lastUpdated,
            ipfsHash: ipfsHash,
            isActive: isActive,
            reputation: reputation
        });
        
        // Send response back to source chain
        _sendDataResponse(response, sourceChainSelector);
        
        // Mark as processed
        processedRequests[requestId] = true;
    }
    
    /**
     * @notice Send reputation data response to destination chain
     * @param response Reputation response data
     * @param destinationChainSelector Destination chain selector
     */
    function _sendDataResponse(
        ReputationResponse memory response,
        uint64 destinationChainSelector
    ) internal {
        
        // Encode response
        bytes memory encodedResponse = abi.encode(response);
        
        // Create CCIP message
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(address(this)),
            data: encodedResponse,
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
        
        emit DataResponseSent(
            response.userAddress,
            destinationChainSelector,
            messageId
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get pending request details
     * @param requestId Request identifier
     * @return request Data request details
     */
    function getPendingRequest(bytes32 requestId) external view returns (DataRequest memory request) {
        return pendingRequests[requestId];
    }
    
    /**
     * @notice Check if request has been processed
     * @param requestId Request identifier
     * @return processed Whether request has been processed
     */
    function isRequestProcessed(bytes32 requestId) external view returns (bool processed) {
        return processedRequests[requestId];
    }
    
    /**
     * @notice Check if a request chain is trusted
     * @param chainSelector Chain selector
     * @return trusted Whether the chain is trusted
     */
    function isTrustedRequestChain(uint64 chainSelector) external view returns (bool trusted) {
        return trustedRequestChains[chainSelector];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Add or remove trusted request chain
     * @param chainSelector Chain selector
     * @param trusted Whether to trust the chain
     */
    function setTrustedRequestChain(uint64 chainSelector, bool trusted) external onlyOwner {
        trustedRequestChains[chainSelector] = trusted;
        emit TrustedRequestChainUpdated(chainSelector, trusted);
    }
    
    /**
     * @notice Update reputation contract address
     * @param _reputationContract New reputation contract address
     */
    function setReputationContract(address _reputationContract) external onlyOwner {
        reputationContract = _reputationContract;
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