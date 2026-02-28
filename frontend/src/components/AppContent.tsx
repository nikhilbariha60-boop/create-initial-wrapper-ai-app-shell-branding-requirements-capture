import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LoginScreen from '../pages/LoginScreen';
import AuthenticatedLayout from './AuthenticatedLayout';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AppContent() {
  const { identity, isInitializing, loginStatus, loginError, clear } = useInternetIdentity();

  // Log authentication state changes for debugging
  useEffect(() => {
    console.log('🔄 AppContent authentication state:', {
      isInitializing,
      hasIdentity: !!identity,
      loginStatus,
      principal: identity?.getPrincipal().toString(),
    });
  }, [isInitializing, identity, loginStatus]);

  // Show loading state while checking for stored identity
  if (isInitializing) {
    console.log('⏳ Initializing authentication...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Handle error state with fallback UI
  if (loginStatus === 'loginError' && !identity) {
    console.error('❌ Authentication error in AppContent:', loginError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {loginError?.message || 'An error occurred during authentication. Please try again.'}
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => {
              console.log('🔄 Clearing authentication state and retrying...');
              clear();
            }}
            className="w-full"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  // Auth gate: if no identity, show only login screen
  if (!identity) {
    console.log('🔓 No identity found, showing login screen');
    return <LoginScreen />;
  }

  // Authenticated: show full app
  console.log('✅ User authenticated, showing authenticated layout');
  return <AuthenticatedLayout />;
}
