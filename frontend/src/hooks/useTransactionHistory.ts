import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { coinQueryKeys } from './coinQueryKeys';
import type { TransactionRecord } from '../backend';

export function useTransactionHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TransactionRecord[]>({
    queryKey: coinQueryKeys.transactions,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTransactionHistory();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
