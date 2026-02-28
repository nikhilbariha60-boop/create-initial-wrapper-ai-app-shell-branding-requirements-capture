import { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Coins } from 'lucide-react';
import { useCoinBalance } from '../hooks/useCoinBalance';
import { ACTION_COST, INSUFFICIENT_COINS_MESSAGE } from '../constants/coins';

interface CoinGateProps {
  children: ReactNode;
  onUpgradeClick: () => void;
  showInsufficientMessage?: boolean;
}

export function CoinGate({ children, onUpgradeClick, showInsufficientMessage = false }: CoinGateProps) {
  const { data: balance, isLoading } = useCoinBalance();

  const hasInsufficientCoins = !isLoading && balance !== undefined && balance < ACTION_COST;

  if (showInsufficientMessage && hasInsufficientCoins) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>{INSUFFICIENT_COINS_MESSAGE}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onUpgradeClick}
            className="flex-shrink-0"
          >
            <Coins className="h-4 w-4 mr-2" />
            Buy Coins
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
