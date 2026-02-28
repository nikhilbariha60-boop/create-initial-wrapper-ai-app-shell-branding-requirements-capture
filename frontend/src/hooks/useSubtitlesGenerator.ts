import { useState } from 'react';
import { useActor } from './useActor';
import type { SubtitleRequest, SubtitleStyle } from '../backend';

interface SubtitlesParams {
  script: string;
  language: string;
  style: SubtitleStyle;
}

export function useSubtitlesGenerator() {
  const { actor } = useActor();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSubtitles = async (params: SubtitlesParams): Promise<{ normal: string; srt: string } | null> => {
    if (!actor) {
      setError('Backend actor not available');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const request: SubtitleRequest = {
        script: params.script,
        language: { [params.language]: null } as any,
        style: params.style,
      };

      const result = await actor.generateSubtitles(request);
      
      // Parse the result to extract normal subtitles and SRT
      const parts = result.split('\n\nSRT Format:\n');
      const normal = parts[0] || result;
      const srt = parts[1] || generateSRTFromText(params.script);

      return { normal, srt };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate subtitles. Please try again.';
      setError(errorMessage);
      console.error('Subtitles generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateSubtitles,
    isGenerating,
    error,
  };
}

// Helper to generate valid SRT format from text
function generateSRTFromText(text: string): string {
  const lines = text.split('\n').filter(line => line.trim());
  let srt = '';
  
  lines.forEach((line, index) => {
    const startSeconds = index * 4;
    const endSeconds = startSeconds + 4;
    
    const startTime = formatSRTTime(startSeconds);
    const endTime = formatSRTTime(endSeconds);
    
    srt += `${index + 1}\n${startTime} --> ${endTime}\n${line}\n\n`;
  });
  
  return srt.trim();
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const ms = 0;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}
