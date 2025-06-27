'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectWalletButtonProps {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ConnectWalletButton({ size = 'default', className }: ConnectWalletButtonProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    size={size}
                    className={cn("font-medium", className)}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    size={size}
                    className={className}
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center space-x-1"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    <span className="text-xs">{chain.name}</span>
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    size={size}
                    className={cn("font-medium", className)}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}