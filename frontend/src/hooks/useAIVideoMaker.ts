import { useState } from 'react';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { VideoRequest, VideoResponse } from '../backend';
import { buildAIVideoMakerSummary } from '../utils/aiVideoMakerSummary';

export interface AIVideoMakerFormData {
  mode: '2D Explainer' | '3D Animated Video' | 'Cartoon Animation' | 'Whiteboard Animation' | 'Motion Graphics';
  videoTopic: string;
  script: string;
  videoLength: '30 sec' | '1 min' | '5 min' | '10 min';
  videoStyle: '2D' | '3D' | 'Cartoon' | 'Whiteboard';
  characterStyle: 'Male' | 'Female' | 'Child' | 'Robot' | 'No character';
  backgroundStyle: 'Studio' | 'City' | 'Nature' | 'Classroom';
  voiceType: 'Male' | 'Female';
  subtitlesEnabled: boolean;
  // New fields
  shortVideoLength: '10s' | '20s' | '30s' | '60s';
  videoFormat: '9:16' | '16:9' | '1:1';
  transition: 'smooth' | 'cinematic' | 'zoom-in' | 'slide' | 'fade';
  motionEffect: boolean;
  textCaptions: boolean;
  aiVoiceoverEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  musicTrimStart: number;
  musicTrimEnd: number;
  musicFadeIn: boolean;
  musicFadeOut: boolean;
  selectedMusicTrack: string | null;
  customMusicFile: string | null;
}

export function useAIVideoMaker() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateScript = async (formData: AIVideoMakerFormData): Promise<string | null> => {
    if (!actor || !identity) {
      setError('Backend actor or identity not available');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const settingsSummary = buildAIVideoMakerSummary(formData);
      const prompt = `Generate a video script for: ${formData.videoTopic}\n\nSettings:\n${settingsSummary}`;

      const request: VideoRequest = {
        creator: identity.getPrincipal(),
        videoTitle: formData.videoTopic,
        mainTopic: prompt,
        requirements: {
          createScript: true,
          scriptLanguage: { en: null } as any,
          voiceLanguage: { en: null } as any,
          includeSubtitles: formData.subtitlesEnabled,
          subtitleLanguage: { en: null } as any,
          autoTranslateSubtitles: false,
        },
      };

      const result = await actor.generateVideoResponse(request);
      return result.script;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate script. Please try again.';
      setError(errorMessage);
      console.error('Script generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStoryboard = async (formData: AIVideoMakerFormData): Promise<string[] | null> => {
    if (!actor || !identity) {
      setError('Backend actor or identity not available');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const settingsSummary = buildAIVideoMakerSummary(formData);
      const prompt = `Generate storyboard for: ${formData.videoTopic}\n\nSettings:\n${settingsSummary}`;

      const request: VideoRequest = {
        creator: identity.getPrincipal(),
        videoTitle: formData.videoTopic,
        mainTopic: prompt,
        requirements: {
          createScript: false,
          scriptLanguage: { en: null } as any,
          voiceLanguage: { en: null } as any,
          includeSubtitles: false,
          subtitleLanguage: { en: null } as any,
          autoTranslateSubtitles: false,
        },
      };

      const result = await actor.generateVideoResponse(request);
      return result.storyboard.scenes;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate storyboard. Please try again.';
      setError(errorMessage);
      console.error('Storyboard generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAnimationPlan = async (formData: AIVideoMakerFormData): Promise<string[] | null> => {
    if (!actor || !identity) {
      setError('Backend actor or identity not available');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const settingsSummary = buildAIVideoMakerSummary(formData);
      const prompt = `Generate animation plan for: ${formData.videoTopic}\n\nSettings:\n${settingsSummary}`;

      const request: VideoRequest = {
        creator: identity.getPrincipal(),
        videoTitle: formData.videoTopic,
        mainTopic: prompt,
        requirements: {
          createScript: false,
          scriptLanguage: { en: null } as any,
          voiceLanguage: { en: null } as any,
          includeSubtitles: false,
          subtitleLanguage: { en: null } as any,
          autoTranslateSubtitles: false,
        },
      };

      const result = await actor.generateVideoResponse(request);
      return result.animationPlan.steps;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate animation plan. Please try again.';
      setError(errorMessage);
      console.error('Animation plan generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFullExport = async (formData: AIVideoMakerFormData): Promise<VideoResponse | null> => {
    if (!actor || !identity) {
      setError('Backend actor or identity not available');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const settingsSummary = buildAIVideoMakerSummary(formData);
      const prompt = `Generate full export for: ${formData.videoTopic}\n\nSettings:\n${settingsSummary}`;

      const request: VideoRequest = {
        creator: identity.getPrincipal(),
        videoTitle: formData.videoTopic,
        mainTopic: prompt,
        requirements: {
          createScript: true,
          scriptLanguage: { en: null } as any,
          voiceLanguage: { en: null } as any,
          includeSubtitles: formData.subtitlesEnabled,
          subtitleLanguage: { en: null } as any,
          autoTranslateSubtitles: false,
        },
      };

      const result = await actor.generateVideoResponse(request);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate export. Please try again.';
      setError(errorMessage);
      console.error('Export generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateScript,
    generateStoryboard,
    generateAnimationPlan,
    generateFullExport,
    isGenerating,
    error,
  };
}
