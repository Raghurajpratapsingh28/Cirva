'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Award, 
  Github, 
  MessageCircle, 
  Twitter, 
  Zap, 
  Shield, 
  Star,
  Trophy,
  Target,
  Flame,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: string;
  category: string;
  points: number;
}

const mockBadges: BadgeData[] = [
  {
    id: 'github-verified',
    name: 'GitHub Verified',
    description: 'Successfully connected and verified GitHub account with OAuth 2.0',
    icon: <Github className="w-6 h-6" />,
    rarity: 'common',
    earned: true,
    earnedDate: '2024-01-15',
    category: 'Verification',
    points: 100
  },
  {
    id: 'discord-member',
    name: 'Discord Member',
    description: 'Active member of the CIRVA Discord community with verified status',
    icon: <MessageCircle className="w-6 h-6" />,
    rarity: 'common',
    earned: true,
    earnedDate: '2024-01-20',
    category: 'Community',
    points: 75
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'One of the first 1000 users to join CIRVA platform',
    icon: <Star className="w-6 h-6" />,
    rarity: 'rare',
    earned: true,
    earnedDate: '2024-01-10',
    category: 'Special',
    points: 250
  },
  {
    id: 'reputation-500',
    name: 'Rising Star',
    description: 'Achieved 500+ overall reputation score across all categories',
    icon: <Trophy className="w-6 h-6" />,
    rarity: 'rare',
    earned: true,
    earnedDate: '2024-02-01',
    category: 'Achievement',
    points: 200
  },
  {
    id: 'developer-elite',
    name: 'Developer Elite',
    description: 'Reached 900+ developer reputation score with verified contributions',
    icon: <Target className="w-6 h-6" />,
    rarity: 'epic',
    earned: true,
    earnedDate: '2024-03-15',
    category: 'Achievement',
    points: 500
  },
  {
    id: 'multi-chain',
    name: 'Multi-Chain Master',
    description: 'Successfully synced profile across 5+ blockchain networks',
    icon: <Zap className="w-6 h-6" />,
    rarity: 'epic',
    earned: false,
    category: 'Technical',
    points: 400
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Verified accounts on 5+ social platforms with high engagement',
    icon: <Twitter className="w-6 h-6" />,
    rarity: 'rare',
    earned: false,
    category: 'Social',
    points: 300
  },
  {
    id: 'legendary-contributor',
    name: 'Legendary Contributor',
    description: 'Achieved maximum reputation score in all categories - ultimate achievement',
    icon: <Flame className="w-6 h-6" />,
    rarity: 'legendary',
    earned: false,
    category: 'Achievement',
    points: 1000
  }
];

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-600'
};

const rarityBorders = {
  common: 'border-gray-300 dark:border-gray-600',
  rare: 'border-blue-300 dark:border-blue-600',
  epic: 'border-purple-300 dark:border-purple-600',
  legendary: 'border-yellow-300 dark:border-yellow-600'
};

const rarityGlows = {
  common: 'hover:shadow-gray-500/20',
  rare: 'hover:shadow-blue-500/30',
  epic: 'hover:shadow-purple-500/40',
  legendary: 'hover:shadow-yellow-500/50'
};

interface BadgeGridProps {
  address: string;
}

export function BadgeGrid({ address }: BadgeGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [badges, setBadges] = useState<BadgeData[]>(mockBadges);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(badges.map(b => b.category.toLowerCase())))];
  
  const filteredBadges = badges.filter(badge => {
    const matchesCategory = selectedCategory === 'all' || badge.category.toLowerCase() === selectedCategory;
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;
  const totalPoints = badges.filter(b => b.earned).reduce((sum, b) => sum + b.points, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="overflow-hidden border-2">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="space-y-2">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Award className="w-6 h-6 text-primary" />
                </motion.div>
                <span>Achievement Badges</span>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {earnedCount}/{totalCount}
                </Badge>
              </CardTitle>
              <CardDescription className="text-base">
                Showcase your Web3 achievements and milestones • {totalPoints} points earned
              </CardDescription>
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search badges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.div
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      <Filter className="w-3 h-3 mr-1" />
                      {category}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${searchTerm}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  variants={itemVariants}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  onHoverStart={() => setHoveredBadge(badge.id)}
                  onHoverEnd={() => setHoveredBadge(null)}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-500 cursor-pointer group ${
                    badge.earned 
                      ? `${rarityBorders[badge.rarity]} bg-gradient-to-br from-background to-muted/20 ${rarityGlows[badge.rarity]} hover:shadow-2xl` 
                      : 'border-muted bg-muted/20 opacity-60 hover:opacity-80'
                  }`}
                >
                  {/* Rarity glow effect */}
                  {badge.earned && hoveredBadge === badge.id && (
                    <motion.div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${rarityColors[badge.rarity]} opacity-10`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  {/* Earned indicator */}
                  {badge.earned && (
                    <motion.div
                      className="absolute top-3 right-3"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    >
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg" />
                    </motion.div>
                  )}
                  
                  <div className="flex flex-col items-center space-y-4 text-center relative z-10">
                    {/* Badge Icon */}
                    <motion.div 
                      className={`p-4 rounded-2xl bg-gradient-to-r ${rarityColors[badge.rarity]} text-white shadow-xl group-hover:shadow-2xl transition-shadow`}
                      whileHover={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      {badge.icon}
                    </motion.div>
                    
                    {/* Badge Info */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-sm leading-tight">{badge.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {badge.description}
                      </p>
                    </div>
                    
                    {/* Badges and Points */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs capitalize font-medium ${
                          badge.rarity === 'legendary' ? 'text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' :
                          badge.rarity === 'epic' ? 'text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-900/20' :
                          badge.rarity === 'rare' ? 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20' :
                          'text-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-900/20'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {badge.rarity}
                      </Badge>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {badge.category}
                      </Badge>
                      <Badge className="text-xs font-bold bg-primary/10 text-primary">
                        +{badge.points}
                      </Badge>
                    </div>
                    
                    {/* Earned Date */}
                    {badge.earned && badge.earnedDate && (
                      <motion.p 
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Earned {new Date(badge.earnedDate).toLocaleDateString()}
                      </motion.p>
                    )}

                    {/* Progress indicator for unearned badges */}
                    {!badge.earned && (
                      <motion.div
                        className="w-full bg-muted rounded-full h-2"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div 
                          className={`h-2 bg-gradient-to-r ${rarityColors[badge.rarity]} rounded-full`}
                          style={{ width: `${Math.random() * 60 + 20}%` }}
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          
          {/* Empty State */}
          {filteredBadges.length === 0 && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">No badges found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'No badges found in this category'}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}