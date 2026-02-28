import type { AIVideoMakerFormData } from '../../hooks/useAIVideoMaker';

export function buildPlaceholderTimeline(formData: AIVideoMakerFormData, photoOrder: string[]): string {
  return `VIDEO TIMELINE PLAN
=====================================

VIDEO SETTINGS:
- Length: ${formData.shortVideoLength}
- Format: ${formData.videoFormat}
- Transition: ${formData.transition}
- Motion Effect: ${formData.motionEffect ? 'ON (Ken Burns)' : 'OFF'}
- Text Captions: ${formData.textCaptions ? 'ON' : 'OFF'}
- AI Voiceover: ${formData.aiVoiceoverEnabled ? 'Enabled' : 'Disabled'}

MUSIC SETTINGS:
- Music: ${formData.musicEnabled ? 'ON' : 'OFF'}
- Volume: ${formData.musicVolume}%
- Trim: ${formData.musicTrimStart}% - ${formData.musicTrimEnd}%
- Fade In: ${formData.musicFadeIn ? 'Yes' : 'No'}
- Fade Out: ${formData.musicFadeOut ? 'Yes' : 'No'}
- Track: ${formData.selectedMusicTrack || formData.customMusicFile || 'None'}

PHOTO SEQUENCE (${photoOrder.length} photos):
${photoOrder.map((photo, i) => `${i + 1}. ${photo} [Transition: ${formData.transition}]${formData.motionEffect ? ' [Ken Burns effect]' : ''}`).join('\n')}

TIMELINE BREAKDOWN:
${photoOrder.map((photo, i) => {
  const duration = parseInt(formData.shortVideoLength) / photoOrder.length;
  const startTime = (duration * i).toFixed(1);
  const endTime = (duration * (i + 1)).toFixed(1);
  return `[${startTime}s - ${endTime}s] Photo ${i + 1}: ${photo}`;
}).join('\n')}

OUTPUT:
This is a placeholder timeline plan. Real MP4 rendering is not supported.
Use this plan to guide your video production in external tools.
`;
}
