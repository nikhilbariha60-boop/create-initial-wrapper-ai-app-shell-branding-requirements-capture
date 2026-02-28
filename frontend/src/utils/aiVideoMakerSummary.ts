import type { AIVideoMakerFormData } from '../hooks/useAIVideoMaker';

export function buildAIVideoMakerSummary(formData: AIVideoMakerFormData): string {
  return `Mode: ${formData.mode}
Length: ${formData.shortVideoLength}
Format: ${formData.videoFormat}
Transition: ${formData.transition}
Motion Effect: ${formData.motionEffect ? 'ON (Ken Burns)' : 'OFF'}
Text Captions: ${formData.textCaptions ? 'ON' : 'OFF'}
AI Voiceover: ${formData.aiVoiceoverEnabled ? 'Enabled' : 'Disabled'}
Style: ${formData.videoStyle}
Character: ${formData.characterStyle}
Background: ${formData.backgroundStyle}
Voice: ${formData.voiceType}
Subtitles: ${formData.subtitlesEnabled ? 'Enabled' : 'Disabled'}
Music: ${formData.musicEnabled ? 'ON' : 'OFF'}${formData.musicEnabled ? `
  Volume: ${formData.musicVolume}%
  Trim: ${formData.musicTrimStart}%-${formData.musicTrimEnd}%
  Fade In: ${formData.musicFadeIn ? 'Yes' : 'No'}
  Fade Out: ${formData.musicFadeOut ? 'Yes' : 'No'}
  Track: ${formData.selectedMusicTrack || formData.customMusicFile || 'None'}` : ''}`;
}
