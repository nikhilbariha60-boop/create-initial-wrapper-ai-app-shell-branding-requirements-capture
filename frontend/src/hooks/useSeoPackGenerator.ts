import { useState } from 'react';
import { useActor } from './useActor';
import type { SeoPackRequest, SeoPackResponse } from '../backend';

interface SeoPackParams {
  videoTitle: string;
  mainTopic: string;
}

export function useSeoPackGenerator() {
  const { actor } = useActor();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSeoPack = async (params: SeoPackParams): Promise<SeoPackResponse | null> => {
    if (!actor) {
      setError('Backend actor not available');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const request: SeoPackRequest = {
        videoTitle: params.videoTitle,
        mainTopic: params.mainTopic,
      };

      const result = await actor.generateSeoPack(request);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate SEO pack. Please try again.';
      setError(errorMessage);
      console.error('SEO pack generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateSeoPack,
    isGenerating,
    error,
  };
}
