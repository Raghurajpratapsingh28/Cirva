// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.4.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @title GetDevScore
 * @notice This is a contract to get the devscore of the user
 */
contract GetDefiScore is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // State variables to store the last request ID, response, and error
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    // Custom error type
    error UnexpectedRequestID(bytes32 requestId);

    // Event to log responses
    event Response(
        bytes32 indexed requestId,
        uint256 defiScore,
        bytes response,
        bytes err
    );

    // Router address - Hardcoded for Sepolia
    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;

    // JavaScript source code
    // Fetch number of followers, public repos, commits, PRs, issues from the github API
    string source =
        "const walletAddress = args[0];"
        "const chainId = args[1];"
        "const apiKey = 'cqt_rQTJpm9Bgbcvk7XJT3WkxdCxFVyf';"
        "const tokenRes = await Functions.makeHttpRequest({"
            "url: `https://api.covalenthq.com/v1/${chainId}/address/${walletAddress}/balances_v2/?key=${apiKey}`"
        "});"
        "if (tokenRes.error) throw Error('Token balance fetch failed');"
            "const items = tokenRes.data.data.items;"
            "let defiProtocols = 0;"
            "for (const item of items) {"
            "if (item.protocol_metadata?.category === 'DeFi') {"
                "defiProtocols++;"
            "}"
        "}"
        "let nftCount = items.filter(i => i.type === 'nft').length;"
        "const txRes = await Functions.makeHttpRequest({"
            "url: `https://api.covalenthq.com/v1/${chainId}/address/${walletAddress}/transactions_v2/?key=${apiKey}`"
        "});"
        "if (txRes.error) throw Error('Tx fetch failed');"
        "const txs = txRes.data.data.items;"
        "let contractsCreated = txs.filter(tx => tx.to_address === null).length;"
        "console.log(`defiProtocols: ${defiProtocols}`);"
        "console.log(`nftCount: ${nftCount}`);"
        "console.log(`contractsCreated: ${contractsCreated}`);"
        "const defiScore = Math.min(defiProtocols * 20, 100);"
        "const nftScore = Math.min(nftCount * 10, 100);"
        "const builderScore = Math.min(contractsCreated * 30, 100);"
        "const totalScore = Math.round(defiScore + nftScore + builderScore);"
        "console.log(`Total score: `, totalScore);"
        "return Functions.encodeUint256(totalScore);";


    //Callback gas limit
    uint32 gasLimit = 300000;

    // donID - Hardcoded for Sepolia
    bytes32 donID =
        0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    // State variable to store the returned score 
    uint256 public defiScore;
    mapping(address => uint256) public defiScoresMap;
    address public currentUser;

    /**
     * @notice Initializes the contract with the Chainlink router address and sets the contract owner
     */
    constructor() FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    /**
     * @notice Sends an HTTP request for character information
     * @param subscriptionId The ID for the Chainlink subscription
     * @param args The arguments to pass to the HTTP request
     * @return requestId The ID of the request
     */
    function sendRequest(
        uint64 subscriptionId,
        string[] calldata args
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source); // Initialize the request with JS code
        if (args.length > 0) req.setArgs(args); // Set the arguments for the request

        // Send the request and store the request ID
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        currentUser = msg.sender;

        return s_lastRequestId;
    }

    /**
     * @notice Callback function for fulfilling a request
     * @param requestId The ID of the request to fulfill
     * @param response The HTTP response data
     * @param err Any errors from the Functions request
     */
    function fulfillRequest(
    bytes32 requestId,
    bytes memory response,
    bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }

        s_lastResponse = response;
        s_lastError = err;

        defiScore = abi.decode(response, (uint256));
        defiScoresMap[currentUser] = defiScore;

        emit Response(requestId, defiScore, s_lastResponse, s_lastError);
    }

    /**
     * @notice function to retrieve the developer's score
     * @param _developerAddress The ID of the request to fulfill
     * @return the devscore of the user
     */
    function getScore(address _developerAddress) external view returns (uint256) {
        return defiScoresMap[_developerAddress];
    }
}
