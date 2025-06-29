// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {CirvaReputation} from "../CirvaReputation.sol";
import {CirvaReputationMirror} from "../CirvaReputationMirror.sol";
import {CirvaDataRequestHandler} from "../CirvaDataRequestHandler.sol";

/**
 * @title DeployCirvaCCIP
 * @notice Deployment script for Cirva CCIP contracts (Testnet Version)
 * @dev Deploys contracts with proper configuration for cross-chain functionality on testnets
 */
contract DeployCirvaCCIP is Script {
    
    // ============ CHAIN SELECTORS (TESTNET) ============
    
    uint64 constant SEPOLIA = 16015286601757825753;
    uint64 constant MUMBAI = 12532609583862916517;
    uint64 constant SEPOLIA_OPTIMISM = 2664363617261496610;
    uint64 constant SEPOLIA_ARBITRUM = 4949039107694359620;
    uint64 constant SEPOLIA_BASE = 15971525489660198786;
    
    // ============ ROUTER ADDRESSES (TESTNET) ============
    
    address constant SEPOLIA_ROUTER = 0xD0daae2231E9CB96b94C8512223533293C3693Bf;
    address constant MUMBAI_ROUTER = 0x70499c328e1E2a3c41108bd3730F6670a44595D1;
    address constant SEPOLIA_OPTIMISM_ROUTER = 0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7;
    address constant SEPOLIA_ARBITRUM_ROUTER = 0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7;
    address constant SEPOLIA_BASE_ROUTER = 0x2a9C5afB0d0e4BAb2BC886Ee82Ac64C9e309a0C7;
    
    // ============ LINK TOKEN ADDRESSES (TESTNET) ============
    
    address constant SEPOLIA_LINK = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address constant MUMBAI_LINK = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address constant SEPOLIA_OPTIMISM_LINK = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address constant SEPOLIA_ARBITRUM_LINK = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address constant SEPOLIA_BASE_LINK = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    
    // ============ DEPLOYMENT VARIABLES ============
    
    CirvaReputation public reputationContract;
    CirvaReputationMirror public mirrorContract;
    CirvaDataRequestHandler public requestHandler;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        // Get current chain ID to determine deployment type
        uint256 chainId = block.chainid;
        
        if (chainId == 11155111) {
            // Deploy on Sepolia (Native Contract)
            _deployNativeContracts();
        } else {
            // Deploy on other testnets (Mirror Contracts)
            _deployMirrorContracts();
        }
        
        vm.stopBroadcast();
    }
    
    /**
     * @notice Deploy native contracts on Sepolia
     */
    function _deployNativeContracts() internal {
        console.log("Deploying native contracts on Sepolia...");
        
        // Deploy main reputation contract
        reputationContract = new CirvaReputation(
            SEPOLIA_ROUTER,
            SEPOLIA_LINK
        );
        
        console.log("CirvaReputation deployed at:", address(reputationContract));
        
        // Deploy data request handler
        requestHandler = new CirvaDataRequestHandler(
            SEPOLIA_ROUTER,
            SEPOLIA_LINK,
            address(reputationContract)
        );
        
        console.log("CirvaDataRequestHandler deployed at:", address(requestHandler));
        
        // Configure supported chains
        reputationContract.setChainSupport(MUMBAI, true);
        reputationContract.setChainSupport(SEPOLIA_OPTIMISM, true);
        reputationContract.setChainSupport(SEPOLIA_ARBITRUM, true);
        reputationContract.setChainSupport(SEPOLIA_BASE, true);
        
        // Configure trusted request chains
        requestHandler.setTrustedRequestChain(MUMBAI, true);
        requestHandler.setTrustedRequestChain(SEPOLIA_OPTIMISM, true);
        requestHandler.setTrustedRequestChain(SEPOLIA_ARBITRUM, true);
        requestHandler.setTrustedRequestChain(SEPOLIA_BASE, true);
        
        console.log("Native contracts deployed and configured successfully!");
    }
    
    /**
     * @notice Deploy mirror contracts on other testnets
     */
    function _deployMirrorContracts() internal {
        console.log("Deploying mirror contracts on chain ID:", block.chainid);
        
        // Get router and LINK addresses for current chain
        (address router, address linkToken) = _getChainAddresses();
        
        // Deploy mirror contract
        mirrorContract = new CirvaReputationMirror(
            router,
            linkToken
        );
        
        console.log("CirvaReputationMirror deployed at:", address(mirrorContract));
        
        // Configure trusted source chain (Sepolia)
        mirrorContract.setTrustedSourceChain(SEPOLIA, true);
        
        console.log("Mirror contract deployed and configured successfully!");
    }
    
    /**
     * @notice Get router and LINK token addresses for current chain
     * @return router Router address
     * @return linkToken LINK token address
     */
    function _getChainAddresses() internal view returns (address router, address linkToken) {
        uint256 chainId = block.chainid;
        
        if (chainId == 80001) {
            // Mumbai (Polygon testnet)
            return (MUMBAI_ROUTER, MUMBAI_LINK);
        } else if (chainId == 11155420) {
            // Sepolia Optimism
            return (SEPOLIA_OPTIMISM_ROUTER, SEPOLIA_OPTIMISM_LINK);
        } else if (chainId == 421614) {
            // Sepolia Arbitrum
            return (SEPOLIA_ARBITRUM_ROUTER, SEPOLIA_ARBITRUM_LINK);
        } else if (chainId == 84532) {
            // Sepolia Base
            return (SEPOLIA_BASE_ROUTER, SEPOLIA_BASE_LINK);
        } else {
            revert("Unsupported testnet chain");
        }
    }
    
    /**
     * @notice Get deployed contract addresses
     * @return reputation Address of reputation contract
     * @return mirror Address of mirror contract
     * @return handler Address of request handler
     */
    function getDeployedAddresses() external view returns (
        address reputation,
        address mirror,
        address handler
    ) {
        return (
            address(reputationContract),
            address(mirrorContract),
            address(requestHandler)
        );
    }
} 