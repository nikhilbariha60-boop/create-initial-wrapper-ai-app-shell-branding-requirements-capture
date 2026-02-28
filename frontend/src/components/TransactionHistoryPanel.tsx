import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, TrendingUp, TrendingDown, Coins } from 'lucide-react';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { TransactionType } from '../backend';

export function TransactionHistoryPanel() {
  const { data: transactions, isLoading } = useTransactionHistory();

  const formatAmount = (amount: bigint, type: TransactionType) => {
    const num = Number(amount);
    if (type === TransactionType.credit) {
      return `+${num}`;
    }
    return `-${num}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="shadow-sm border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Transaction History
        </CardTitle>
        <CardDescription>Recent coin activity and feature usage</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions && transactions.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction, index) => {
                const isCredit = transaction.transactionType === TransactionType.credit;
                return (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCredit ? 'bg-green-500/10' : 'bg-destructive/10'
                        }`}
                      >
                        {isCredit ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{transaction.feature}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-sm font-semibold ${
                          isCredit ? 'text-green-600' : 'text-destructive'
                        }`}
                      >
                        {formatAmount(transaction.amount, transaction.transactionType)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Balance: {Number(transaction.balanceAfter)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet. Start using features to see your activity here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
