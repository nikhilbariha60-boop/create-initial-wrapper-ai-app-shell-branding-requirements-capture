import { useState } from 'react';
import { useActor } from './useActor';
import type { VoiceoverRequest, VoiceGender, VoiceSpeed, Emotion } from '../backend';

interface VoiceoverParams {
  script: string;
  voiceGender: VoiceGender;
  language: string;
  speed: VoiceSpeed;
  emotion: Emotion;
}

export function useVoiceoverGenerator() {
  const { actor } = useActor();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateVoiceover = async (params: VoiceoverParams): Promise<string | null> => {
    if (!actor) {
      setError('Backend actor not available');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const request: VoiceoverRequest = {
        script: params.script,
        voiceGender: params.voiceGender,
        language: { [params.language]: null } as any,
        speed: params.speed,
        emotion: params.emotion,
      };

      const result = await actor.generateVoiceover(request);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate voiceover. Please try again.';
      setError(errorMessage);
      console.error('Voiceover generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateVoiceover,
    isGenerating,
    error,
  };
}
