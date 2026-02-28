import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { coinQueryKeys } from './coinQueryKeys';
import type { CoinPurchasePlan } from '../backend';

export function useCoinPurchasePlans() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CoinPurchasePlan[]>({
    queryKey: coinQueryKeys.plans,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listCoinPurchasePlans();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
