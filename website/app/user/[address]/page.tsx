import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
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

async function fetchUserProfile(address: string) {
  if (!address || address.length < 10) return null;
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    console.log('Fetching profile for address:', address);
    const res = await fetch(`${protocol}://${host}/api/user/search?publicKey=${address}`, {
      cache: 'no-store',
    });
    console.log('Response status:', res.status);
    if (!res.ok) {
      console.error('Response not ok:', res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    console.log('Fetched data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const data = await fetchUserProfile(params.address);

  if (!data || data.error) {
    notFound();
  }

  const profile = {
    address: params.address,
    ens: null,
    reputation: data.reputation,
    badges: data.badges.totalBadges,
    verifiedPlatforms: data.verifiedPlatforms,
    lastUpdated: data.lastUpdated,
    isPublic: true,
    ratings: data.ratings,
    scores: data.scores,
    badgeBreakdown: data.badges.breakdown,
    badgeDetails: data.badges.badges,
  };

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
            <div className="text-sm text-muted-foreground">Reputation Score</div>
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
                  <Badge variant="secondary">{score as number}</Badge>
                </div>
                <Progress value={((score as number) / 1000) * 100} className="h-2" />
              </div>
            )) as React.ReactNode[]}
          </CardContent>
        </Card>

        <ReputationGraph />
      </div>

      {/* Ratings Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Ratings Overview</CardTitle>
          <CardDescription>
            Star ratings across different categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.ratings && (Object.entries(profile.ratings).map(([category, rating]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="capitalize font-medium">{category}</span>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={`w-4 h-4 inline-block ${i < (rating as number) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">{rating as number}/5</span>
                </div>
              </div>
              <Progress value={((rating as number) / 5) * 100} className="h-2" />
            </div>
          )) as React.ReactNode[])}
        </CardContent>
      </Card>

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
            {profile.verifiedPlatforms.map((platform: string) => (
              <Badge key={platform} variant="secondary" className="text-sm">
                {platform}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <BadgeGrid address={params.address} />

      {/* Badge Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Categories</CardTitle>
          <CardDescription>
            Achievements across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Platform Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">Platform Badges</h4>
                <Badge variant="secondary">{profile.badgeBreakdown.platform}</Badge>
              </div>
              <div className="space-y-1">
                {(Object.entries(profile.badgeDetails.platform).map(([platform, badge]) =>
                  badge && (
                    <div key={platform} className="text-sm text-muted-foreground flex items-center space-x-2">
                      <span>🏅</span>
                      <span>{badge as string}</span>
                    </div>
                  )
                ) as React.ReactNode[])}
              </div>
            </div>
            {/* Score Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">Score Badges</h4>
                <Badge variant="secondary">{profile.badgeBreakdown.score}</Badge>
              </div>
              <div className="space-y-1">
                {(Object.entries(profile.badgeDetails.score).map(([category, badge]) =>
                  badge && (
                    <div key={category} className="text-sm text-muted-foreground flex items-center space-x-2">
                      <span>🏆</span>
                      <span>{badge as string}</span>
                    </div>
                  )
                ) as React.ReactNode[])}
              </div>
            </div>
            {/* Rating Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">Rating Badges</h4>
                <Badge variant="secondary">{profile.badgeBreakdown.rating}</Badge>
              </div>
              <div className="space-y-1">
                {(Object.entries(profile.badgeDetails.rating).map(([category, badge]) =>
                  badge && (
                    <div key={category} className="text-sm text-muted-foreground flex items-center space-x-2">
                      <span>⭐</span>
                      <span>{badge as string}</span>
                    </div>
                  )
                ) as React.ReactNode[])}
              </div>
            </div>
            {/* Achievement Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">Achievements</h4>
                <Badge variant="secondary">{profile.badgeBreakdown.achievement}</Badge>
              </div>
              <div className="space-y-1">
                {(Object.entries(profile.badgeDetails.achievement).map(([achievement, badge]) =>
                  badge && (
                    <div key={achievement} className="text-sm text-muted-foreground flex items-center space-x-2">
                      <span>🎖️</span>
                      <span>{badge as string}</span>
                    </div>
                  )
                ) as React.ReactNode[])}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // In a real app, fetch a list of addresses from your data source
  return [
    { address: '0x1234567890abcdef1234' },
    { address: '0xabcdef1234567890abcd' },
  ];
}