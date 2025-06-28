'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { OAuthVerificationButton } from './OAuthVerificationButton';
import { 
  ArrowLeft, 
  CheckCircle, 
  Github, 
  MessageCircle, 
  Twitter,
  Shield,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'verified' | 'pending' | 'unverified';
  points: number;
  color: string;
}

interface VerificationStepperProps {
  platform: Platform;
  onBack: () => void;
}

export function VerificationStepper({ platform, onBack }: VerificationStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    {
      title: 'Secure Authentication',
      description: 'Connect your account securely via OAuth'
    },
    {
      title: 'Verification Complete',
      description: 'Your account has been verified'
    }
  ];

  // Check URL parameters for verification results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success') === 'true';
    const platformParam = urlParams.get('platform');
    
    if (success && platformParam === platform.id) {
      const username = urlParams.get('username');
      const score = urlParams.get('score');
      
      setVerificationData({ username, score });
      setCurrentStep(1);
      setIsComplete(true);
      
      // Clean up URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [platform.id]);

  const handleVerificationStart = () => {
    toast.info(`Starting ${platform.name} verification...`);
  };

  const handleVerificationComplete = (success: boolean, data?: any) => {
    if (success) {
      setVerificationData(data);
      setCurrentStep(1);
      setIsComplete(true);
      toast.success(`${platform.name} verified successfully!`);
    } else {
      toast.error(`${platform.name} verification failed`);
    }
  };

  const handleFinish = () => {
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${platform.color} text-white`}>
              {platform.icon}
            </div>
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Verify {platform.name}</span>
                <Badge variant="secondary">+{platform.points} pts</Badge>
              </CardTitle>
              <CardDescription>{platform.description}</CardDescription>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep ? 'bg-green-500 text-white' :
                  index === currentStep ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-muted mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Secure OAuth Authentication</h3>
                    <p className="text-muted-foreground">
                      We'll securely connect to your {platform.name} account using OAuth 2.0. 
                      Your credentials are never stored on our servers.
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">What happens next:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• You'll be redirected to {platform.name}'s secure login page</li>
                    <li>• Log in with your {platform.name} credentials</li>
                    <li>• Authorize CIRVA to access your public profile information</li>
                    <li>• We'll calculate your reputation score and award points</li>
                  </ul>
                </div>

                <OAuthVerificationButton
                  platform={platform}
                  onVerificationStart={handleVerificationStart}
                  onVerificationComplete={handleVerificationComplete}
                />
              </motion.div>
            )}

            {currentStep === 1 && isComplete && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Verification Complete!</h3>
                    <p className="text-muted-foreground">
                      Your {platform.name} account has been successfully verified and linked to your CIRVA profile.
                    </p>
                  </div>
                </div>

                {verificationData && (
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-green-800 dark:text-green-400">
                      Verification Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Username:</span>
                        <span className="ml-2 font-medium">{verificationData.username}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Points Earned:</span>
                        <span className="ml-2 font-medium text-green-600">
                          +{verificationData.score || platform.points}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-4 text-sm">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                  <Badge variant="secondary">
                    +{platform.points} Reputation Points
                  </Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Separator />

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Platforms
            </Button>

            {isComplete && (
              <Button onClick={handleFinish}>
                Continue to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}