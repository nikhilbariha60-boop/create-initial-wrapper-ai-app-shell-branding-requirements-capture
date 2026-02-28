import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { coinQueryKeys } from './coinQueryKeys';

export function usePurchaseCoins() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: number) => {
      if (!actor) throw new Error('Actor not available');
      const newBalance = await actor.purchaseCoins(BigInt(planId));
      return Number(newBalance);
    },
    onSuccess: () => {
      // Invalidate coin balance and transaction history
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.balance });
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.transactions });
    },
  });
}
