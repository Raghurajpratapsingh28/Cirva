// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.4.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @title GetDevScore
 * @notice This is a contract to get the devscore of the user
 */
contract GetDevScore is FunctionsClient, ConfirmedOwner {
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
        uint256 devScore,
        bytes response,
        bytes err
    );

    // Router address - Hardcoded for Sepolia
    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;

    // JavaScript source code
    // Fetch number of followers, public repos, commits, PRs, issues from the github API
    string source =
        "const username = args[0];"
        "const headers = {"
            "'User-Agent': 'CIRVA-Agent'"
        "};"
        "const profileResponse = await Functions.makeHttpRequest({"
            "url: `https://api.github.com/users/${username}`,"
            "headers"
        "});"
        "if (profileResponse.error) {"
            "throw Error('Failed to fetch GitHub profile');"
        "}"
        "const profile = profileResponse.data;"
        "const eventsResponse = await Functions.makeHttpRequest({"
            "url: `https://api.github.com/users/${username}/events/public`,"
            "headers"
        "});"
        "if (eventsResponse.error) {"
            "throw Error('Failed to fetch GitHub events');"
        "}"
        "const events = eventsResponse.data;"
        "let commitCount = 0;"
        "let prCount = 0;"
        "let issueCount = 0;"
        "for (const event of events) {"
            "if (event.type === 'PushEvent') {"
                "commitCount += event.payload.commits.length;"
            "} else if (event.type === 'PullRequestEvent') {"
                "prCount += 1;"
            "} else if (event.type === 'IssuesEvent') {"
                "issueCount += 1;"
            "}"
        "}"
        "let language = 'unknown';"
        "if (profile.public_repos > 0) {"
            "const reposResponse = await Functions.makeHttpRequest({"
                "url: `https://api.github.com/users/${username}/repos?sort=updated&per_page=1`,"
                "headers"
            "});"
            "if (!reposResponse.error && reposResponse.data.length > 0) {"
                "const topRepo = reposResponse.data[0];"
                "const langResponse = await Functions.makeHttpRequest({"
                    "url: topRepo.languages_url,"
                    "headers"
                "});"

                "if (!langResponse.error && Object.keys(langResponse.data).length > 0) {"
                    "language = Object.keys(langResponse.data)[0];"
                "}"
            "}"
        "}"
        "console.log(`GitHub Followers: ${profile.followers}`);"
        "console.log(`Public Repos: ${profile.public_repos}`);"
        "console.log(`Commits: ${commitCount}, PRs: ${prCount}, Issues: ${issueCount}`);"
        "console.log(`Top Language: ${language}`);"
        "const developerScore ="
        "profile.followers * 0.3 +"
        "profile.public_repos * 0.2 +"
        "commitCount * 0.2 +"
        "prCount * 0.2 +"
        "issueCount * 0.1;"
        "return Functions.encodeUint256(Math.round(developerScore));";

    //Callback gas limit
    uint32 gasLimit = 300000;

    // donID - Hardcoded for Sepolia
    bytes32 donID =
        0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    // State variable to store the returned score 
    uint256 public devScore;
    mapping(address => uint256) public developerScores;
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
        devScore = abi.decode(response, (uint256));
        developerScores[currentUser] = devScore;
        s_lastError = err;

        // Emit an event to log the response
        emit Response(requestId, devScore, s_lastResponse, s_lastError);
    }

    /**
     * @notice function to retrieve the developer's score
     * @param _developerAddress The ID of the request to fulfill
     * @return the devscore of the user
     */
    function getScore(address _developerAddress) external view returns (uint256) {
        return developerScores[_developerAddress];
    }
}
