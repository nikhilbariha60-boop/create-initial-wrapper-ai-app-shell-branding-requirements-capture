import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { RouteKey } from '../hooks/useHashRoute';

interface PaymentFailureScreenProps {
  onNavigate: (view: RouteKey) => void;
  onBuyCoins?: () => void;
}

export default function PaymentFailureScreen({ onNavigate, onBuyCoins }: PaymentFailureScreenProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was cancelled or failed. No charges were made to your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted text-sm text-muted-foreground">
            If you experienced an issue during checkout, please try again. Your coins balance has not been affected.
          </div>

          <div className="flex flex-col gap-2">
            {onBuyCoins && (
              <Button
                onClick={onBuyCoins}
                className="w-full gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onNavigate('dashboard')}
              className="w-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
