// Centralized React Query keys for coin-related queries
export const coinQueryKeys = {
  balance: ['coinBalance'] as const,
  plans: ['coinPurchasePlans'] as const,
  transactions: ['transactionHistory'] as const,
};
