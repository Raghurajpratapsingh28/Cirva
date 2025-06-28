import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/Navbar';
import { Web3Provider } from '@/components/Web3Provider';
import { ParticleBackground } from '@/components/ParticleBackground';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CIRVA - Cross-Chain Identity & Reputation',
  description: 'Build your decentralized Web3 reputation across chains with advanced analytics and secure verification',
  keywords: ['Web3', 'Identity', 'Reputation', 'Cross-chain', 'DeFi', 'Blockchain', 'NFT', 'IPFS'],
  authors: [{ name: 'CIRVA Team' }],
  creator: 'CIRVA',
  publisher: 'CIRVA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cirva.app'),
  openGraph: {
    title: 'CIRVA - Cross-Chain Identity & Reputation',
    description: 'Build your decentralized Web3 reputation across chains',
    url: 'https://cirva.app',
    siteName: 'CIRVA',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CIRVA - Cross-Chain Identity & Reputation',
    description: 'Build your decentralized Web3 reputation across chains',
    creator: '@cirva_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider>
            <div className="min-h-screen relative">
              <ParticleBackground />
              <div className="relative z-10">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  {children}
                </main>
              </div>
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--card-foreground))',
                  },
                }}
              />
            </div>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}