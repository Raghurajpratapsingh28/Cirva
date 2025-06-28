'use client';

import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { 
  Globe, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface ChainStatus {
  id: string;
  name: string;
  status: 'synced' | 'pending' | 'failed' | 'not_synced';
  lastSync?: string;
  blockNumber?: number;
}

const mockChainStatuses: ChainStatus[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    status: 'synced',
    lastSync: '2024-01-15T10:30:00Z',
    blockNumber: 18500000
  },
  {
    id: 'polygon',
    name: 'Polygon',
    status: 'synced',
    lastSync: '2024-01-15T10:25:00Z',
    blockNumber: 52000000
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    status: 'pending',
    lastSync: '2024-01-15T09:45:00Z',
    blockNumber: 150000000
  },
  {
    id: 'optimism',
    name: 'Optimism',
    status: 'not_synced'
  },
  {
    id: 'base',
    name: 'Base',
    status: 'failed',
    lastSync: '2024-01-14T15:20:00Z'
  }
];

export function SyncStatusBadge() {
  const [chainStatuses, setChainStatuses] = useState<ChainStatus[]>(mockChainStatuses);
  const [isOpen, setIsOpen] = useState(false);

  const syncedCount = chainStatuses.filter(chain => chain.status === 'synced').length;
  const totalCount = chainStatuses.length;
  const hasPending = chainStatuses.some(chain => chain.status === 'pending');

  const getStatusIcon = (status: ChainStatus['status']) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'pending':
        return <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'not_synced':
        return <Globe className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ChainStatus['status']) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'not_synced':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="space-x-1">
          <Globe className={`w-4 h-4 ${hasPending ? 'animate-pulse' : ''}`} />
          <span className="text-xs">
            {syncedCount}/{totalCount}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Cross-Chain Sync Status</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                // Mock refresh action
                setChainStatuses(chains => 
                  chains.map(chain => ({
                    ...chain,
                    status: chain.status === 'failed' ? 'pending' : chain.status
                  }))
                );
              }}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {chainStatuses.map((chain) => (
              <div key={chain.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(chain.status)}
                  <span className="text-sm font-medium">{chain.name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(chain.status)}`}
                  >
                    {chain.status.replace('_', ' ')}
                  </Badge>
                  {chain.lastSync && (
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(chain.lastSync)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>
              Profile data is automatically synced across supported chains using Chainlink CCIP.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}