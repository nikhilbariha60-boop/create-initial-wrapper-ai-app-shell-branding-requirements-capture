import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, LogIn, AlertCircle } from 'lucide-react';
import { useHashRoute } from '../hooks/useHashRoute';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginScreen() {
  const { login, loginStatus, identity, loginError } = useInternetIdentity();
  const { navigate } = useHashRoute();

  const isLoggingIn = loginStatus === 'logging-in';
  const isLoginError = loginStatus === 'loginError';

  // Redirect to dashboard after successful login
  useEffect(() => {
    if (identity) {
      console.log('✅ Login successful! Principal:', identity.getPrincipal().toString());
      console.log('🔄 Redirecting to dashboard...');
      navigate('dashboard');
    }
  }, [identity, navigate]);

  const handleLogin = async () => {
    console.log('🔐 Login initiated by user');
    console.log('⏰ Timestamp:', new Date().toISOString());

    try {
      // Detect if popup blockers might interfere
      const testPopup = window.open('', '_blank', 'width=1,height=1');
      if (!testPopup || testPopup.closed || typeof testPopup.closed === 'undefined') {
        console.warn('⚠️ Popup blocker detected - attempting fallback');
        toast.warning('Popup Blocker Detected', {
          description: 'Please allow popups for this site to enable Internet Identity login.',
        });
      } else {
        testPopup.close();
      }

      console.log('🚀 Calling Internet Identity login...');
      await login();
      console.log('✅ Login call completed successfully');
    } catch (error: any) {
      console.error('❌ Login error occurred:', error);
      console.error('Error type:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);

      // Handle specific error cases
      if (error.message === 'User is already authenticated') {
        console.log('ℹ️ User already authenticated, redirecting to dashboard');
        navigate('dashboard');
      } else {
        toast.error('Login Failed', {
          description: error?.message || 'An unexpected error occurred during login. Please try again.',
        });
      }
    }
  };

  // Log authentication state changes
  useEffect(() => {
    console.log('🔄 Authentication state changed:', {
      loginStatus,
      hasIdentity: !!identity,
      isError: isLoginError,
      errorMessage: loginError?.message,
    });
  }, [loginStatus, identity, isLoginError, loginError]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src="/assets/generated/wrapper-ai-logo.dim_512x512.png"
                alt="Wrapper AI Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl"
              />
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Wrapper AI
                </h1>
                <span className="text-xs text-muted-foreground font-normal">
                  AI-Powered Assistant
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <Card className="w-full max-w-md shadow-lg border-2">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl">Welcome to Wrapper AI</CardTitle>
            <CardDescription className="text-base">
              Sign in with Internet Identity to access your AI assistant dashboard, chat, and all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Alert */}
            {isLoginError && loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {loginError.message || 'Login failed. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-12 text-base"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            {/* Retry Button for Errors */}
            {isLoginError && (
              <Button
                onClick={handleLogin}
                variant="outline"
                className="w-full"
              >
                Retry Login
              </Button>
            )}

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Secure authentication powered by Internet Computer</p>
              <p className="text-xs">New users receive 200 free coins on first login</p>
              <p className="text-xs text-muted-foreground/70">
                Internet Identity opens in a new window. Please allow popups if prompted.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} Wrapper AI. All rights reserved.
            </p>
            <p className="text-center sm:text-right">
              Built with{' '}
              <span className="text-primary inline-block animate-pulse">♥</span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'wrapper-ai'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
