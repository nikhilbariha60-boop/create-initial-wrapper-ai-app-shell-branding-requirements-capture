import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@dfinity/principal';

export function useAdminAddCoins() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      targetPrincipal,
      coinAmount,
    }: {
      targetPrincipal: Principal;
      coinAmount: bigint;
    }): Promise<void> => {
      if (!actor) throw new Error('Actor not available');
      await actor.adminAddCoins(targetPrincipal, coinAmount);
    },
  });
}
