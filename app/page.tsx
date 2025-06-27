'use client';

import { motion } from 'framer-motion';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  GitBranch, 
  Zap, 
  Globe, 
  CheckCircle, 
  UserCheck,
  Link as LinkIcon,
  Award,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Lock,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
};

const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isVerifiedGithub, setIsVerifiedGithub] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [isVerifiedTwitter, setIsVerifiedTwitter] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState<string | null>(null);
  const [isVerifiedDiscord, setIsVerifiedDiscord] = useState(false);
  const [discordUsername, setDiscordUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) return;
    fetch(`/api/user/profile?publicKey=${address}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.isVerifiedGithub) {
          setIsVerifiedGithub(true);
          setGithubUsername(data.githubUsername || null);
        } else {
          setIsVerifiedGithub(false);
          setGithubUsername(null);
        }
        if (data && data.isVerifiedTwitter) {
          setIsVerifiedTwitter(true);
          setTwitterUsername(data.twitterUsername || null);
        } else {
          setIsVerifiedTwitter(false);
          setTwitterUsername(null);
        }
        if (data && data.isVerifiedDiscord) {
          setIsVerifiedDiscord(true);
          setDiscordUsername(data.discordUsername || null);
        } else {
          setIsVerifiedDiscord(false);
          setDiscordUsername(null);
        }
      });
  }, [isConnected, address]);

  return (
    <div className="space-y-32 overflow-hidden">
      {/* Hero Section */}
      <motion.section 
        className="text-center space-y-12 py-20 relative"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Floating elements */}
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 blur-xl"
          animate={{ 
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div variants={fadeInUp} className="space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Badge variant="secondary" className="mb-6 px-6 py-2 text-sm font-medium bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Chainlink CCIP & Advanced AI
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold leading-tight"
            variants={fadeInUp}
          >
            <span className="block gradient-text-primary animate-gradient">
              Build Your
            </span>
            <span className="block mt-2">
              Web3 Reputation
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Aggregate your onchain and offchain activities into a unified, 
            cross-chain identity with verifiable reputation scores and soulbound achievements.
          </motion.p>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <ConnectWalletButton size="lg" className="text-lg px-10 py-6 btn-primary" />
          <Button variant="outline" size="lg" className="text-lg px-10 py-6 group" asChild>
            <Link href="/dashboard">
              <span>Explore Demo</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-16"
        >
          {[
            { label: "Active Users", value: "10,000+", icon: <UserCheck className="w-6 h-6" /> },
            { label: "Verified Platforms", value: "50+", icon: <CheckCircle className="w-6 h-6" /> },
            { label: "Cross-Chain Networks", value: "15+", icon: <Globe className="w-6 h-6" /> },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center space-y-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center text-primary mb-2">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold gradient-text-primary">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Verified Platforms Section (GitHub, Twitter, Discord) */}
      {isConnected && (isVerifiedGithub || isVerifiedTwitter || isVerifiedDiscord) && (
        <motion.section
          className="flex flex-wrap justify-center gap-6 my-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {isVerifiedGithub && (
            <Card className="w-full max-w-md border-2 border-green-400/30 shadow-lg bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-background">
              <CardContent className="p-8 flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 16.42 5.06 20.06 9.26 21.14C9.86 21.24 10.08 20.88 10.08 20.56C10.08 20.28 10.07 19.5 10.07 18.62C7 19.28 6.34 17.36 6.34 17.36C5.82 16.08 5.03 15.76 5.03 15.76C3.91 15.06 5.12 15.08 5.12 15.08C6.36 15.18 7 16.36 7 16.36C8.09 18.18 9.91 17.68 10.54 17.38C10.64 16.6 10.92 16.08 11.23 15.8C8.99 15.52 6.62 14.62 6.62 10.44C6.62 9.26 7.05 8.32 7.76 7.58C7.65 7.3 7.27 6.18 7.86 4.74C7.86 4.74 8.74 4.44 10.07 5.58C10.91 5.34 11.81 5.22 12.71 5.22C13.61 5.22 14.51 5.34 15.35 5.58C16.68 4.44 17.56 4.74 17.56 4.74C18.15 6.18 17.77 7.3 17.66 7.58C18.37 8.32 18.8 9.26 18.8 10.44C18.8 14.63 16.42 15.52 14.18 15.8C14.59 16.16 14.96 16.86 14.96 17.92C14.96 19.36 14.95 20.22 14.95 20.56C14.95 20.88 15.17 21.25 15.78 21.14C19.98 20.06 23.04 16.42 23.04 12C23.04 6.48 18.52 2 12 2Z" fill="#22c55e"/></svg>
                  <span className="font-bold text-lg text-green-700 dark:text-green-400">GitHub Verified</span>
                  {githubUsername && (
                    <span className="text-muted-foreground text-sm">@{githubUsername}</span>
                  )}
                </div>
                <Button className="w-full mt-2" variant="outline" size="lg" asChild>
                  <a href="/dashboard" className="flex items-center justify-center">
                    ViewDevScore
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
          {isVerifiedTwitter && (
            <Card className="w-full max-w-md border-2 border-blue-400/30 shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-background">
              <CardContent className="p-8 flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.71-.02-1.38-.22-1.97-.54v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.12 2.94 3.99 2.97A8.6 8.6 0 0 1 2 19.54c-.29 0-.57-.02-.85-.05A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22.46 6z" fill="#3b82f6"/></svg>
                  <span className="font-bold text-lg text-blue-700 dark:text-blue-400">Twitter Verified</span>
                  {twitterUsername && (
                    <span className="text-muted-foreground text-sm">@{twitterUsername}</span>
                  )}
                </div>
                <Button className="w-full mt-2" variant="outline" size="lg" asChild>
                  <a href="/dashboard" className="flex items-center justify-center">
                    ViewDevScore
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
          {isVerifiedDiscord && (
            <Card className="w-full max-w-md border-2 border-indigo-400/30 shadow-lg bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-background">
              <CardContent className="p-8 flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.1a.112.112 0 0 0-.119.056c-.523.927-1.104 2.13-1.513 3.084a17.876 17.876 0 0 0-5.505 0c-.409-.963-.99-2.157-1.513-3.084A.115.115 0 0 0 8.115 3.1a19.736 19.736 0 0 0-3.432 1.27.105.105 0 0 0-.047.043C2.042 7.045 1.18 9.58 1.5 12.07c0 .01.005.02.01.03a19.9 19.9 0 0 0 5.993 3.03.112.112 0 0 0 .123-.04c.462-.63.874-1.295 1.226-1.994a.112.112 0 0 0-.062-.155 12.6 12.6 0 0 1-1.792-.86.112.112 0 0 1-.011-.186c.12-.09.24-.18.353-.27a.112.112 0 0 1 .114-.01c3.781 1.73 7.87 1.73 11.627 0a.112.112 0 0 1 .115.01c.113.09.233.18.353.27a.112.112 0 0 1-.01.186c-.57.33-1.16.62-1.792.86a.112.112 0 0 0-.062.155c.36.7.773 1.364 1.226 1.994a.112.112 0 0 0 .123.04 19.876 19.876 0 0 0 6.002-3.03.112.112 0 0 0 .01-.03c.38-3.03-.63-5.565-2.136-7.658a.098.098 0 0 0-.047-.043zM8.02 13.32c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.41 2.15-2.41 1.21 0 2.17 1.09 2.15 2.41 0 1.33-.95 2.41-2.15 2.41zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.41 2.15-2.41 1.21 0 2.17 1.09 2.15 2.41 0 1.33-.95 2.41-2.15 2.41z" fill="#6366f1"/></svg>
                  <span className="font-bold text-lg text-indigo-700 dark:text-indigo-400">Discord Verified</span>
                  {discordUsername && (
                    <span className="text-muted-foreground text-sm">@{discordUsername}</span>
                  )}
                </div>
                <Button className="w-full mt-2" variant="outline" size="lg" asChild>
                  <a href="/dashboard" className="flex items-center justify-center">
                    ViewDevScore
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.section>
      )}

      {/* How It Works Section */}
      <motion.section 
        className="space-y-16"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">How CIRVA Works</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Three simple steps to build your decentralized reputation with enterprise-grade security
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={staggerContainer}
        >
          {[
            {
              step: "01",
              title: "Connect & Secure",
              description: "Link your wallet and start building your CIRVA profile with military-grade encryption",
              icon: <Shield className="w-10 h-10" />,
              gradient: "from-blue-500 to-cyan-500",
              delay: 0
            },
            {
              step: "02", 
              title: "Verify & Authenticate",
              description: "Connect GitHub, Discord, and other platforms using secure OAuth 2.0 authentication",
              icon: <UserCheck className="w-10 h-10" />,
              gradient: "from-purple-500 to-pink-500",
              delay: 0.2
            },
            {
              step: "03",
              title: "Sync & Scale",
              description: "Synchronize your reputation across multiple blockchain networks with Chainlink CCIP",
              icon: <LinkIcon className="w-10 h-10" />,
              gradient: "from-green-500 to-emerald-500",
              delay: 0.4
            }
          ].map((item, index) => (
            <motion.div 
              key={index} 
              variants={scaleIn}
              custom={item.delay}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="relative overflow-hidden h-full card-hover border-2 hover:border-primary/20 group">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="p-8 text-center space-y-6 relative z-10">
                  <div className="relative">
                    <motion.div 
                      className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center mx-auto text-white shadow-2xl`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {item.icon}
                    </motion.div>
                    <Badge 
                      variant="outline" 
                      className="absolute -top-2 -right-2 bg-background text-xs font-bold px-3 py-1"
                    >
                      STEP {item.step}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features Grid */}
      <motion.section 
        className="space-y-16"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need for Web3 identity and reputation management with cutting-edge technology
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
        >
          {[
            {
              title: "Cross-Chain Sync",
              description: "Seamlessly sync your reputation across Ethereum, Polygon, Arbitrum, and 15+ networks",
              icon: <Globe className="w-8 h-8" />,
              gradient: "from-blue-500 to-cyan-500",
              features: ["15+ Networks", "Real-time Sync", "CCIP Powered"]
            },
            {
              title: "GitHub Integration",
              description: "Showcase your development contributions and open source work with detailed analytics",
              icon: <GitBranch className="w-8 h-8" />,
              gradient: "from-purple-500 to-pink-500",
              features: ["OAuth 2.0", "Contribution Analysis", "Repository Scoring"]
            },
            {
              title: "AI-Powered Scoring",
              description: "Advanced machine learning algorithms calculate your reputation based on comprehensive activity",
              icon: <Zap className="w-8 h-8" />,
              gradient: "from-orange-500 to-red-500",
              features: ["ML Algorithms", "Real-time Updates", "Predictive Analytics"]
            },
            {
              title: "Soulbound NFTs",
              description: "Mint non-transferable tokens that represent your achievements and milestones",
              icon: <Award className="w-8 h-8" />,
              gradient: "from-green-500 to-emerald-500",
              features: ["IPFS Storage", "Verifiable Credentials", "Achievement System"]
            }
          ].map((feature, index) => (
            <motion.div 
              key={index} 
              variants={index % 2 === 0 ? slideInLeft : slideInRight}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="h-full card-hover group relative overflow-hidden border-2 hover:border-primary/20">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="p-8 space-y-6 relative z-10">
                  <motion.div 
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:shadow-2xl transition-shadow`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-xl">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.features.map((feat, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Trust & Security Section */}
      <motion.section
        className="space-y-16"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Enterprise-Grade Security</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built with the highest security standards and trusted by thousands of Web3 professionals
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          variants={staggerContainer}
        >
          {[
            {
              icon: <Lock className="w-8 h-8" />,
              title: "Zero-Knowledge Proofs",
              description: "Your data remains private while maintaining verifiability"
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "OAuth 2.0 Security",
              description: "Industry-standard authentication with no credential storage"
            },
            {
              icon: <Layers className="w-8 h-8" />,
              title: "IPFS Decentralization",
              description: "Distributed storage ensures data permanence and availability"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="text-center space-y-4 p-6"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto text-white">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="text-center py-24 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-3xl" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Build Your Reputation?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of Web3 professionals who trust CIRVA for their decentralized identity management
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <ConnectWalletButton size="lg" className="btn-primary text-lg px-10 py-6" />
            <Button variant="outline" size="lg" className="text-lg px-10 py-6 group" asChild>
              <Link href="/verify">
                <span>Start Verification</span>
                <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center justify-center space-x-8 text-sm text-muted-foreground pt-8"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Setup in 2 minutes</span>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}