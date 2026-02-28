import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { VideoRequest } from '../backend';
import { isInsufficientCoinsError, getCoinErrorMessage } from '../utils/coinErrors';
import { coinQueryKeys } from './coinQueryKeys';

export interface YouTubeScriptFormData {
  topic: string;
  scriptLanguage: string;
  voiceLanguage: string;
  subtitleLanguage: string;
  autoTranslate: boolean;
  length: '1' | '5' | '10';
  tone: 'Funny' | 'Serious' | 'Motivational';
  targetAudience: string;
  includeTimestamps: boolean;
  includeVoiceoverLines: boolean;
}

export function useYouTubeScript() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insufficientCoins, setInsufficientCoins] = useState(false);

  const generateScript = async (formData: YouTubeScriptFormData): Promise<string | null> => {
    if (!actor || !identity) {
      setError('Backend actor or identity not available');
      return null;
    }

    setIsGenerating(true);
    setError(null);
    setInsufficientCoins(false);

    try {
      // Build a detailed prompt for the AI
      let prompt = `Generate a YouTube video script with the following specifications:

Topic: ${formData.topic}
Script Language: ${formData.scriptLanguage}
Voice Language: ${formData.voiceLanguage}
Subtitle Language: ${formData.subtitleLanguage}
Video Length: ${formData.length} minute(s)
Tone: ${formData.tone}
Target Audience: ${formData.targetAudience}
${formData.includeTimestamps ? 'Include timestamps for each section.' : ''}
${formData.includeVoiceoverLines ? 'Include voiceover style lines (marked as VO:) where appropriate.' : ''}`;

      if (formData.autoTranslate) {
        prompt += `\n\nIMPORTANT: Auto-translate the final script into ${formData.scriptLanguage}.`;
      }

      prompt += `

Please structure the script with these sections in order:
1. Hook (First 5 seconds)
2. Introduction
3. Main Points (in sequence)
4. Examples / Story (if applicable)
5. CTA (Like/Subscribe)
6. Outro

Format the output with clear headings (###) and bullet points where appropriate.`;

      // Create VideoRequest matching backend interface
      const request: VideoRequest = {
        creator: identity.getPrincipal(),
        videoTitle: formData.topic,
        mainTopic: prompt,
        requirements: {
          createScript: true,
          scriptLanguage: { en: null } as any, // Placeholder - backend uses enum
          voiceLanguage: { en: null } as any,
          includeSubtitles: true,
          subtitleLanguage: { en: null } as any,
          autoTranslateSubtitles: formData.autoTranslate,
        },
      };

      // Use generateVideoResponse instead of generateYouTubeScript
      const result = await actor.generateVideoResponse(request);

      // Invalidate coin balance and transaction history
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.balance });
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.transactions });

      return result.script;
    } catch (err: any) {
      if (isInsufficientCoinsError(err)) {
        setInsufficientCoins(true);
        setError(getCoinErrorMessage(err));
      } else {
        setError(err?.message || 'Failed to generate script. Please try again.');
      }
      console.error('Script generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateScript,
    isGenerating,
    error,
    insufficientCoins,
  };
}
