import { ReactNode, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useHashRoute } from '../hooks/useHashRoute';
import { useCoinBalance } from '../hooks/useCoinBalance';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { Button } from '@/components/ui/button';
import { CoinPurchaseDialog } from './CoinPurchaseDialog';
import LinkShare from './LinkShare';
import {
  Home,
  MessageSquare,
  User,
  Video,
  Clapperboard,
  Mail,
  ImageIcon,
  LogOut,
  Coins,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import DashboardScreen from '../pages/DashboardScreen';
import AIChatScreen from '../pages/AIChatScreen';
import ProfileScreen from '../pages/ProfileScreen';
import YouTubeScriptScreen from '../pages/YouTubeScriptScreen';
import AIVideoMakerScreen from '../pages/AIVideoMakerScreen';
import ColdEmailScreen from '../pages/ColdEmailScreen';
import AIImageGeneratorScreen from '../pages/AIImageGeneratorScreen';
import PaymentSuccessScreen from '../pages/PaymentSuccessScreen';
import PaymentFailureScreen from '../pages/PaymentFailureScreen';
import AdminPanelScreen from '../pages/AdminPanelScreen';
import { LOW_BALANCE_THRESHOLD } from '../constants/coins';

export default function AuthenticatedLayout() {
  const { clear } = useInternetIdentity();
  const { currentView, navigate } = useHashRoute();
  const { data: coinBalance, isLoading: balanceLoading } = useCoinBalance();
  const { data: isAdmin } = useIsAdmin();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const balance = coinBalance ?? 0;
  const showLowBalanceWarning = balance > 0 && balance < LOW_BALANCE_THRESHOLD;

  const handleLogout = async () => {
    await clear();
    window.location.hash = '';
  };

  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'chat' as const, label: 'AI Chat', icon: MessageSquare },
    { id: 'youtube-script' as const, label: 'YouTube Script', icon: Video },
    { id: 'ai-video-maker' as const, label: 'AI Video Maker', icon: Clapperboard },
    { id: 'cold-email' as const, label: 'Cold Email', icon: Mail },
    { id: 'ai-image-generator' as const, label: 'AI Image Generator', icon: ImageIcon },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'chat':
        return <AIChatScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'youtube-script':
        return <YouTubeScriptScreen />;
      case 'ai-video-maker':
        return <AIVideoMakerScreen />;
      case 'cold-email':
        return <ColdEmailScreen />;
      case 'ai-image-generator':
        return <AIImageGeneratorScreen />;
      case 'payment-success':
        return <PaymentSuccessScreen onNavigate={navigate} />;
      case 'payment-failure':
        return (
          <PaymentFailureScreen
            onNavigate={navigate}
            onBuyCoins={() => {
              navigate('dashboard');
              setShowPurchaseDialog(true);
            }}
          />
        );
      case 'admin-panel':
        return <AdminPanelScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/wrapper-ai-logo.dim_512x512.png"
              alt="Wrapper AI"
              className="h-8 w-8"
            />
            <span className="font-bold text-xl hidden sm:inline">Wrapper AI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigate(item.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Button>
              );
            })}
            {isAdmin && (
              <Button
                variant={currentView === 'admin-panel' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate('admin-panel')}
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden xl:inline">Admin</span>
              </Button>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Share Button (Desktop) */}
            <div className="hidden sm:block">
              <LinkShare />
            </div>

            {/* Coin Balance */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              <Coins className="h-4 w-4" />
              {balanceLoading ? (
                <span className="text-sm font-medium">...</span>
              ) : (
                <span className="text-sm font-medium">{balance}</span>
              )}
            </div>

            {/* Low Balance Warning */}
            {showLowBalanceWarning && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPurchaseDialog(true)}
                className="hidden md:flex gap-2 border-primary/50 text-primary hover:bg-primary/10"
              >
                <Coins className="h-4 w-4" />
                Upgrade
              </Button>
            )}

            {/* Logout Button (Desktop) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Logout</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <nav className="container py-4 px-4 space-y-1">
              {/* Coin Balance (Mobile) */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 text-primary mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm font-medium">Balance:</span>
                </div>
                {balanceLoading ? (
                  <span className="text-sm font-medium">...</span>
                ) : (
                  <span className="text-sm font-bold">{balance} coins</span>
                )}
              </div>

              {/* Share (Mobile) */}
              <div className="px-1 py-1">
                <LinkShare />
              </div>

              {/* Menu Items */}
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      navigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}

              {/* Admin Panel (Mobile) */}
              {isAdmin && (
                <Button
                  variant={currentView === 'admin-panel' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    navigate('admin-panel');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Button>
              )}

              {/* Logout (Mobile) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6">{renderContent()}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-6 mt-auto">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Wrapper AI. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Coin Purchase Dialog */}
      <CoinPurchaseDialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog} />
    </div>
  );
}
