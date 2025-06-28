import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'CIRVA - Cross-Chain Identity & Reputation',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
});

export const supportedChains = [
  {
    id: mainnet.id,
    name: 'Ethereum',
    shortName: 'ETH',
    icon: '🔷',
    rpcUrl: mainnet.rpcUrls.default.http[0],
    blockExplorer: mainnet.blockExplorers.default.url,
  },
  {
    id: polygon.id,
    name: 'Polygon',
    shortName: 'MATIC',
    icon: '🟣',
    rpcUrl: polygon.rpcUrls.default.http[0],
    blockExplorer: polygon.blockExplorers.default.url,
  },
  {
    id: optimism.id,
    name: 'Optimism',
    shortName: 'OP',
    icon: '🔴',
    rpcUrl: optimism.rpcUrls.default.http[0],
    blockExplorer: optimism.blockExplorers.default.url,
  },
  {
    id: arbitrum.id,
    name: 'Arbitrum',
    shortName: 'ARB',
    icon: '🔵',
    rpcUrl: arbitrum.rpcUrls.default.http[0],
    blockExplorer: arbitrum.blockExplorers.default.url,
  },
  {
    id: base.id,
    name: 'Base',
    shortName: 'BASE',
    icon: '🟦',
    rpcUrl: base.rpcUrls.default.http[0],
    blockExplorer: base.blockExplorers.default.url,
  },
];