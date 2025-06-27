import { notFound } from 'next/navigation';
import { ProfileCard } from '@/components/ProfileCard';
import { ReputationGraph } from '@/components/ReputationGraph';
import { BadgeGrid } from '@/components/BadgeGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: {
    address: string;
  };
}

// Mock function to validate and fetch profile data
async function getProfileData(address: string) {
  // In a real app, validate the address and fetch from IPFS/blockchain
  if (!address || address.length < 10) {
    return null;
  }

  // Mock profile data
  return {
    address,
    ens: null,
    reputation: {
      overall: 756,
      developer: 820,
      contributor: 690,
      social: 580,
      defi: 760
    },
    badges: 8,
    verifiedPlatforms: ['GitHub', 'Discord'],
    lastUpdated: new Date().toISOString(),
    isPublic: true
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const profile = await getProfileData(params.address);

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Public Profile</h1>
          <p className="text-muted-foreground">
            Viewing reputation for {profile.ens || `${params.address.slice(0, 6)}...${params.address.slice(-4)}`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </Button>
        </div>
      </div>

      {/* Profile Overview */}
      <ProfileCard address={params.address} profile={profile} isPublic />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {profile.reputation.overall}
            </div>
            <div className="text-sm text-muted-foreground">Overall Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {profile.reputation.developer}
            </div>
            <div className="text-sm text-muted-foreground">Developer</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {profile.badges}
            </div>
            <div className="text-sm text-muted-foreground">Badges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {profile.verifiedPlatforms.length}
            </div>
            <div className="text-sm text-muted-foreground">Verified</div>
          </CardContent>
        </Card>
      </div>

      {/* Reputation Breakdown & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Reputation Breakdown</CardTitle>
            <CardDescription>
              Scores across different categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(profile.reputation).map(([category, score]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="capitalize font-medium">{category}</span>
                  <Badge variant="secondary">{score}</Badge>
                </div>
                <Progress value={(score / 1000) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <ReputationGraph />
      </div>

      {/* Verified Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Verified Platforms</CardTitle>
          <CardDescription>
            Connected and verified social platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.verifiedPlatforms.map((platform) => (
              <Badge key={platform} variant="secondary" className="text-sm">
                {platform}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <BadgeGrid address={params.address} />

      {/* Profile Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2">
                {new Date(profile.lastUpdated).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Profile Status:</span>
              <Badge variant="secondary" className="ml-2">
                {profile.isPublic ? 'Public' : 'Private'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}