// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.4.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @title GetDevScore
 * @notice This is a contract to get the devscore of the user
 */
contract GetCommunityScore is FunctionsClient, ConfirmedOwner {
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
        uint256 communityScore,
        bytes response,
        bytes err
    );

    // Router address - Hardcoded for Sepolia
    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;

    // JavaScript source code
    // Fetch number of followers, public repos, commits, PRs, issues from the github API
    string source =
        "const userId = args[0];"
        "const token = secrets.discordBotToken;"
        "const headers = {"
            "Authorization: `Bot MTM4ODQ1MzczNTAyOTgwNTEyNg.G3PCml.cqoJ5gBiQeKmW7lB5-oCbtoNsoq3WsnNG_g_3E`"
        "};"
        "const userResponse = await Functions.makeHttpRequest({"
            "url: `https://discord.com/api/guilds/709736381660004372/members/${userId}`,"
            "headers"
        "});"
        "if (userResponse.error) {"
            "throw Error('Failed to fetch Discord user info');"
        "}"
        "const userData = userResponse.data;"
        "const user = userData.user;"
        "const hasAvatar = !!user.avatar;"
        "const hasNickname = !!userData.nick;"
        "const publicFlags = user.public_flags || 0;"
        "const roleCount = userData.roles.length;"
        "const badgeWeight = publicFlags * 1;"
        "const avatarBonus = hasAvatar ? 50 : 0;"
        "const nicknameBonus = hasNickname ? 20 : 0;"
        "const roleScore = Math.min(roleCount, 10) * 5;"
        "const joinedAt = new Date(userData.joined_at);"
        "const daysInServer = Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));"
        "const tenureScore = Math.min(daysInServer, 365) * 0.5;"
        "const ogBonus = joinedAt < new Date('2023-01-01') ? 30 : 0;"
        "const totalScore = Math.round("
            "badgeWeight +"
            "avatarBonus +"
            "nicknameBonus +"
            "roleScore +"
            "tenureScore +"
            "ogBonus"
        ");"
        "console.log(`Discord Score: ${totalScore}`);"
        "return Functions.encodeUint256(totalScore);";



    //Callback gas limit
    uint32 gasLimit = 300000;

    // donID - Hardcoded for Sepolia
    bytes32 donID =
        0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    // State variable to store the returned score 
    uint256 public communityScore;
    mapping(address => uint256) public communityScoresMap;
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
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }
        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        communityScore = abi.decode(response, (uint256));
        communityScoresMap[currentUser] = communityScore;
        s_lastError = err;

        // Emit an event to log the response
        emit Response(requestId, communityScore, s_lastResponse, s_lastError);
    }

    /**
     * @notice function to retrieve the developer's score
     * @param _developerAddress The ID of the request to fulfill
     * @return the devscore of the user
     */
    function getScore(address _developerAddress) external view returns (uint256) {
        return communityScoresMap[_developerAddress];
    }
}
