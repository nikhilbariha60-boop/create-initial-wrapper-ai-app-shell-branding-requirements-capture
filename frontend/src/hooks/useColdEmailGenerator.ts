import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ColdEmailRequest, ColdEmailResponse } from '../backend';
import { isInsufficientCoinsError, getCoinErrorMessage } from '../utils/coinErrors';
import { coinQueryKeys } from './coinQueryKeys';

export function useColdEmailGenerator() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insufficientCoins, setInsufficientCoins] = useState(false);

  const generateColdEmail = async (request: ColdEmailRequest): Promise<ColdEmailResponse | null> => {
    if (!actor) {
      setError('Backend actor not available. Please try again.');
      return null;
    }

    setIsGenerating(true);
    setError(null);
    setInsufficientCoins(false);

    try {
      const response = await actor.generateColdEmail(request);

      // Invalidate coin balance and transaction history
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.balance });
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.transactions });

      return response;
    } catch (err: any) {
      if (isInsufficientCoinsError(err)) {
        setInsufficientCoins(true);
        setError(getCoinErrorMessage(err));
      } else {
        setError(err?.message || 'Failed to generate cold email. Please try again.');
      }
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateColdEmail,
    isGenerating,
    error,
    insufficientCoins,
  };
}
