import { useState } from 'react';
import { Shield, UserPlus, Loader2, AlertCircle, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useAdminAddCoins } from '../hooks/useAdminAddCoins';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export default function AdminPanelScreen() {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { mutate: adminAddCoins, isPending } = useAdminAddCoins();

  const [targetPrincipal, setTargetPrincipal] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const [principalError, setPrincipalError] = useState('');

  const validatePrincipal = (value: string): boolean => {
    try {
      Principal.fromText(value);
      setPrincipalError('');
      return true;
    } catch {
      setPrincipalError('Invalid principal ID format');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePrincipal(targetPrincipal)) return;

    const amount = parseInt(coinAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid coin amount greater than 0');
      return;
    }

    let principal: Principal;
    try {
      principal = Principal.fromText(targetPrincipal);
    } catch {
      toast.error('Invalid principal ID');
      return;
    }

    adminAddCoins(
      { targetPrincipal: principal, coinAmount: BigInt(amount) },
      {
        onSuccess: () => {
          toast.success(`Successfully added ${amount} coins to ${targetPrincipal}`);
          setTargetPrincipal('');
          setCoinAmount('');
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Failed to add coins. Please try again.');
        },
      }
    );
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access the Admin Panel. This area is restricted to administrators only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts and coin balances</p>
        </div>
      </div>

      {/* Add Coins Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Coins to User
          </CardTitle>
          <CardDescription>
            Manually credit coins to any user account. This action will be recorded in the user's transaction history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">User Principal ID</Label>
              <Input
                id="principal"
                placeholder="e.g. aaaaa-aa or xxxxx-xxxxx-xxxxx-xxxxx-cai"
                value={targetPrincipal}
                onChange={(e) => {
                  setTargetPrincipal(e.target.value);
                  if (principalError) validatePrincipal(e.target.value);
                }}
                className={principalError ? 'border-destructive' : ''}
                disabled={isPending}
              />
              {principalError && (
                <p className="text-sm text-destructive">{principalError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the Internet Identity principal ID of the user
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coins">Coin Amount</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="coins"
                  type="number"
                  min="1"
                  placeholder="Enter number of coins"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  className="pl-9"
                  disabled={isPending}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Number of coins to add to the user's balance
              </p>
            </div>

            <Button
              type="submit"
              disabled={isPending || !targetPrincipal || !coinAmount}
              className="w-full gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding Coins...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4" />
                  Add Coins
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Admin Actions are Logged</p>
              <p className="text-sm text-muted-foreground">
                All coin additions are recorded in the target user's transaction history as "Admin Reward" entries. Use this feature responsibly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
