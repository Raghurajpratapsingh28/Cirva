'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Network, 
  Users,
  Star,
  TrendingUp,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data for demonstration
const MOCK_REPUTATION = {
  reputationScore: 850,
  devRating: 85,
  communityRating: 90,
  socialRating: 75,
  defiRating: 80,
  overallRating: "Excellent"
};

const MOCK_NETWORKS = [
  { id: 'mumbai', name: 'Mumbai', chainId: 80001, status: 'synced' },
  { id: 'sepolia-optimism', name: 'Sepolia Optimism', chainId: 11155420, status: 'pending' },
  { id: 'sepolia-arbitrum', name: 'Sepolia Arbitrum', chainId: 421614, status: 'not-synced' },
  { id: 'sepolia-base', name: 'Sepolia Base', chainId: 84532, status: 'synced' },
];

export function CCIPDemo() {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const handleSync = async () => {
    if (!selectedNetwork) {
      toast.error('Please select a network to sync to');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          toast.success(`Successfully synced to ${selectedNetwork}!`);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setIsSyncing(false);
      setSyncProgress(100);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'not-synced':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'not-synced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cross-Chain Reputation Demo (Testnet)</h2>
          <p className="text-muted-foreground">
            Test the cross-chain reputation synchronization functionality on testnet networks
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Network className="w-4 h-4" />
          CCIP Testnet Enabled
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Reputation Overview
                </CardTitle>
                <CardDescription>
                  Current reputation data with detailed ratings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge variant="secondary">{MOCK_REPUTATION.reputationScore}/1000</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Developer Rating</span>
                    <span className="text-sm font-medium">{MOCK_REPUTATION.devRating}/100</span>
                  </div>
                  <Progress value={MOCK_REPUTATION.devRating} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Community Rating</span>
                    <span className="text-sm font-medium">{MOCK_REPUTATION.communityRating}/100</span>
                  </div>
                  <Progress value={MOCK_REPUTATION.communityRating} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Social Rating</span>
                    <span className="text-sm font-medium">{MOCK_REPUTATION.socialRating}/100</span>
                  </div>
                  <Progress value={MOCK_REPUTATION.socialRating} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DeFi Rating</span>
                    <span className="text-sm font-medium">{MOCK_REPUTATION.defiRating}/100</span>
                  </div>
                  <Progress value={MOCK_REPUTATION.defiRating} className="h-2" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Rating</span>
                  <Badge className="bg-blue-100 text-blue-800">{MOCK_REPUTATION.overallRating}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Testnet Network Status
                </CardTitle>
                <CardDescription>
                  Cross-chain synchronization status on testnet networks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_NETWORKS.map((network) => (
                  <div key={network.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(network.status)}
                      <div>
                        <p className="font-medium">{network.name}</p>
                        <p className="text-sm text-muted-foreground">Chain ID: {network.chainId}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(network.status)}>
                      {network.status.replace('-', ' ')}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Sync to Testnet Network
              </CardTitle>
              <CardDescription>
                Synchronize your reputation data to another testnet blockchain network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Destination Testnet</label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a testnet to sync to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai (Polygon Testnet)</SelectItem>
                    <SelectItem value="sepolia-optimism">Sepolia Optimism</SelectItem>
                    <SelectItem value="sepolia-arbitrum">Sepolia Arbitrum</SelectItem>
                    <SelectItem value="sepolia-base">Sepolia Base</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedNetwork && (
                <Alert>
                  <AlertDescription>
                    Syncing to <strong>{selectedNetwork}</strong> will update your reputation data on that testnet.
                    This operation requires testnet LINK tokens for gas fees.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleSync} 
                disabled={!selectedNetwork || isSyncing}
                className="w-full"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing... {syncProgress}%
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Sync to {selectedNetwork || 'Testnet'}
                  </>
                )}
              </Button>

              {isSyncing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sync Progress</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Total Syncs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Testnets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-sm text-muted-foreground">Connected testnet chains</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">96%</div>
                <p className="text-sm text-muted-foreground">Successful syncs</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 