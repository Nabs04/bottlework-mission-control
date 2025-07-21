import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Package, 
  Home, 
  MapPin, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  Bell
} from 'lucide-react';
import { useState } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const { profile, signOut } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const adminNavItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: MapPin, label: 'Missions', href: '/missions' },
    { icon: Users, label: 'Employees', href: '/employees' },
    { icon: Settings, label: 'Reports', href: '/reports' },
  ];

  const employeeNavItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: MapPin, label: 'Browse', href: '/browse' },
    { icon: Settings, label: 'Profile', href: '/profile' },
  ];

  const navItems = profile?.role === 'admin' ? adminNavItems : employeeNavItems;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-card shadow-mobile-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">BottleWork</h1>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile?.role} Portal
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <Bell className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 p-0"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-card border-b shadow-mobile-md">
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => {
                    setShowMobileMenu(false);
                    window.location.href = item.href;
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Button>
              ))}
              
              <div className="border-t pt-2 mt-4">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{profile?.user_id}</p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setShowMobileMenu(false);
                    signOut();
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-mobile-lg z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.slice(0, 4).map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className="flex-col h-auto py-2 px-1 gap-1 text-xs"
              onClick={() => window.location.href = item.href}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;