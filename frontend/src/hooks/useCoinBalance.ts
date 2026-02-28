import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { coinQueryKeys } from './coinQueryKeys';

export function useCoinBalance() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<number>({
    queryKey: coinQueryKeys.balance,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const balance = await actor.getCoinBalance();
      return Number(balance);
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
