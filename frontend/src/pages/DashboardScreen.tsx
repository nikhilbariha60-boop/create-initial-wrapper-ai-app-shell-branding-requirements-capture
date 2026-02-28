import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, Sparkles, ArrowRight, Video, Film, Mail, ImageIcon, Coins, TrendingUp, CheckCircle, Shield } from 'lucide-react';
import { useHashRoute } from '../hooks/useHashRoute';
import { useCoinBalance } from '../hooks/useCoinBalance';
import { CoinPurchaseDialog } from '../components/CoinPurchaseDialog';
import { TransactionHistoryPanel } from '../components/TransactionHistoryPanel';
import { LOW_BALANCE_THRESHOLD } from '../constants/coins';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useProfile';

export default function DashboardScreen() {
  const { navigate } = useHashRoute();
  const { data: coinBalance, isLoading: balanceLoading, isFetched: balanceFetched } = useCoinBalance();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isLowBalance = coinBalance !== undefined && coinBalance <= LOW_BALANCE_THRESHOLD;

  const principalId = identity?.getPrincipal().toString() || '';
  const displayName = userProfile?.displayName || 'User';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          <span>AI Assistant Dashboard</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
          Welcome to Wrapper AI
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          Your intelligent assistant is ready. Choose a feature below to get started.
        </p>
      </div>

      {/* Authentication Status Card */}
      <Card className="shadow-sm border-2 bg-gradient-to-br from-green-500/5 to-green-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-foreground">
                Successfully authenticated via Internet Identity
              </p>
              {!profileLoading && userProfile && (
                <p className="text-sm text-muted-foreground">
                  Logged in as: <span className="font-semibold text-foreground">{displayName}</span>
                </p>
              )}
              <div className="bg-muted/50 rounded-lg p-3 mt-2">
                <p className="text-xs text-muted-foreground mb-1">Your Principal ID:</p>
                <p className="text-xs font-mono text-foreground break-all">
                  {principalId}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Your identity is securely stored and managed by the Internet Computer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coin Balance Card */}
      {balanceLoading && !balanceFetched ? (
        <Card className="shadow-sm border-2 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Your Coin Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </CardContent>
        </Card>
      ) : (
        coinBalance !== undefined && (
          <Card className="shadow-sm border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Your Coin Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-foreground">{coinBalance}</p>
                  <p className="text-sm text-muted-foreground mt-1">Available Coins</p>
                </div>
                <Button
                  onClick={() => setPurchaseDialogOpen(true)}
                  size="lg"
                  className="gap-2"
                >
                  <Coins className="h-5 w-5" />
                  Buy More Coins
                </Button>
              </div>

              {isLowBalance && (
                <Alert className="bg-destructive/10 border-destructive/20">
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    Your coin balance is running low. Consider purchasing more coins to avoid interruptions.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )
      )}

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        {/* AI Chat Card */}
        <Card className="shadow-sm border-2 hover:border-primary/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate('chat')}>
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">AI Chat</CardTitle>
            <CardDescription className="text-base">
              Start a conversation with your AI assistant. Ask questions, get insights, and explore ideas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full group-hover:bg-primary/90" onClick={() => navigate('chat')}>
              Open AI Chat
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* YouTube Script Generator Card */}
        <Card className="shadow-sm border-2 hover:border-primary/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate('youtube-script')}>
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
              <Video className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">YouTube Script</CardTitle>
            <CardDescription className="text-base">
              Generate professional YouTube video scripts with hooks, intros, main points, and CTAs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full group-hover:border-destructive group-hover:text-destructive" onClick={() => navigate('youtube-script')}>
              Create Script
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* AI Video Maker Card */}
        <Card className="shadow-sm border-2 hover:border-primary/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate('ai-video-maker')}>
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
              <Film className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-2xl">AI Video Maker</CardTitle>
            <CardDescription className="text-base">
              Create complete video production plans with scripts, storyboards, and animation instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full group-hover:border-accent group-hover:text-accent" onClick={() => navigate('ai-video-maker')}>
              Create Video Plan
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* AI Image Generator Card */}
        <Card className="shadow-sm border-2 hover:border-primary/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate('ai-image-generator')}>
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
              <ImageIcon className="h-6 w-6 text-secondary-foreground" />
            </div>
            <CardTitle className="text-2xl">AI Image Generator</CardTitle>
            <CardDescription className="text-base">
              Generate stunning AI images with advanced parameters and style controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full group-hover:border-secondary group-hover:text-secondary-foreground" onClick={() => navigate('ai-image-generator')}>
              Generate Image
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* Cold Email Generator Card */}
        <Card className="shadow-sm border-2 hover:border-primary/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate('cold-email')}>
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-muted/80 transition-colors">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Cold Email Generator</CardTitle>
            <CardDescription className="text-base">
              Create professional cold email campaigns with subject lines, main email, and follow-ups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('cold-email')}>
              Generate Email
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="shadow-sm border-2 hover:border-primary/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate('profile')}>
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Profile</CardTitle>
            <CardDescription className="text-base">
              Manage your profile settings, view your principal, and logout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('profile')}>
              View Profile
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <TransactionHistoryPanel />

      {/* Getting Started Info */}
      <Card className="shadow-sm border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">How the Coin System Works</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Each AI feature costs 20 coins per use</li>
              <li>New users receive 200 free coins on first login</li>
              <li>Purchase more coins anytime from the dashboard or header</li>
              <li>Track your usage in the transaction history below</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Available Features</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>AI Chat: Conversational AI assistant with image support</li>
              <li>YouTube Script: Generate complete video scripts with voiceover and subtitles</li>
              <li>AI Video Maker: Create video production plans with storyboards</li>
              <li>AI Image Generator: Generate images with advanced parameters</li>
              <li>Cold Email: Professional email campaigns with follow-ups</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Coin Purchase Dialog */}
      <CoinPurchaseDialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen} />
    </div>
  );
}
