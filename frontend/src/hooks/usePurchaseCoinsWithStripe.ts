import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { coinQueryKeys } from './coinQueryKeys';

export function usePurchaseCoinsWithStripe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stripeSessionId,
      planId,
    }: {
      stripeSessionId: string;
      planId: bigint;
    }): Promise<bigint> => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.purchaseCoinsWithStripe(stripeSessionId, planId);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.balance });
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.transactions });
    },
  });
}
