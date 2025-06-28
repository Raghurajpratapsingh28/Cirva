'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectWalletButton } from './ConnectWalletButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/verify', label: 'Verify' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              CIRVA
            </span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "block px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-primary hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="pt-4 border-t">
            <ConnectWalletButton className="w-full" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}