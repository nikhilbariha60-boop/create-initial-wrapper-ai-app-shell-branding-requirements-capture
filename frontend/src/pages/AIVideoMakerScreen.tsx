import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Loader2, Film, Copy, CheckCircle2, Download, Music, Upload, Play } from 'lucide-react';
import { useAIVideoMaker, AIVideoMakerFormData } from '../hooks/useAIVideoMaker';
import { toast } from 'sonner';
import type { VideoResponse } from '../backend';
import MusicLibraryPanel from './ai-video-maker/MusicLibraryPanel';
import PhotoTimelineBuilder from './ai-video-maker/PhotoTimelineBuilder';
import { buildPlaceholderTimeline } from './ai-video-maker/buildPlaceholderTimeline';
import { downloadTextFile } from '../utils/downloadTextFile';

export default function AIVideoMakerScreen() {
  const { generateScript, generateStoryboard, generateAnimationPlan, generateFullExport, isGenerating, error } = useAIVideoMaker();
  
  const [formData, setFormData] = useState<AIVideoMakerFormData>({
    mode: '2D Explainer',
    videoTopic: '',
    script: '',
    videoLength: '1 min',
    videoStyle: '2D',
    characterStyle: 'Male',
    backgroundStyle: 'Studio',
    voiceType: 'Male',
    subtitlesEnabled: true,
    // New fields
    shortVideoLength: '30s',
    videoFormat: '16:9',
    transition: 'smooth',
    motionEffect: false,
    textCaptions: true,
    aiVoiceoverEnabled: false,
    musicEnabled: false,
    musicVolume: 50,
    musicTrimStart: 0,
    musicTrimEnd: 100,
    musicFadeIn: false,
    musicFadeOut: false,
    selectedMusicTrack: null,
    customMusicFile: null,
  });

  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [storyboard, setStoryboard] = useState<string[] | null>(null);
  const [animationPlan, setAnimationPlan] = useState<string[] | null>(null);
  const [fullExport, setFullExport] = useState<VideoResponse | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [photoOrder, setPhotoOrder] = useState<string[]>([]);
  const [videoTimeline, setVideoTimeline] = useState<string | null>(null);

  const handleGenerateScript = async () => {
    if (!formData.videoTopic.trim()) {
      toast.error('Please enter a video topic');
      return;
    }

    const script = await generateScript(formData);
    if (script) {
      setGeneratedScript(script);
      setFormData({ ...formData, script });
      toast.success('Script generated successfully!');
    }
  };

  const handleGenerateStoryboard = async () => {
    if (!formData.videoTopic.trim() && !formData.script.trim()) {
      toast.error('Please enter a video topic or script');
      return;
    }

    const scenes = await generateStoryboard(formData);
    if (scenes) {
      setStoryboard(scenes);
      toast.success('Storyboard generated successfully!');
    }
  };

  const handleGenerateAnimationPlan = async () => {
    if (!formData.videoTopic.trim() && !formData.script.trim()) {
      toast.error('Please enter a video topic or script');
      return;
    }

    const steps = await generateAnimationPlan(formData);
    if (steps) {
      setAnimationPlan(steps);
      toast.success('Animation plan generated successfully!');
    }
  };

  const handleGenerateVideo = () => {
    if (photoOrder.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    const timeline = buildPlaceholderTimeline(formData, photoOrder);
    setVideoTimeline(timeline);
    toast.success('Video timeline generated!');
  };

  const handleDownloadMP4 = () => {
    if (!videoTimeline) {
      toast.error('Please generate video timeline first');
      return;
    }

    downloadTextFile(videoTimeline, `video-timeline-${Date.now()}.txt`);
    toast.success('Video timeline downloaded (placeholder MP4)!');
  };

  const handleExport = async () => {
    if (!formData.videoTopic.trim() && !formData.script.trim()) {
      toast.error('Please enter a video topic or script');
      return;
    }

    const exportData = await generateFullExport(formData);
    if (exportData) {
      setFullExport(exportData);
      
      const exportText = `AI VIDEO MAKER - EXPORT PLAN
=====================================

VIDEO TITLE: ${formData.videoTopic}
MODE: ${formData.mode}
LENGTH: ${formData.videoLength}
SHORT LENGTH: ${formData.shortVideoLength}
FORMAT: ${formData.videoFormat}
TRANSITION: ${formData.transition}
MOTION EFFECT: ${formData.motionEffect ? 'ON (Ken Burns)' : 'OFF'}
TEXT CAPTIONS: ${formData.textCaptions ? 'ON' : 'OFF'}
AI VOICEOVER: ${formData.aiVoiceoverEnabled ? 'Enabled' : 'Disabled'}
STYLE: ${formData.videoStyle}
CHARACTER: ${formData.characterStyle}
BACKGROUND: ${formData.backgroundStyle}
VOICE: ${formData.voiceType}
SUBTITLES: ${formData.subtitlesEnabled ? 'Enabled' : 'Disabled'}

MUSIC SETTINGS:
Music: ${formData.musicEnabled ? 'ON' : 'OFF'}
Volume: ${formData.musicVolume}%
Trim: ${formData.musicTrimStart}% - ${formData.musicTrimEnd}%
Fade In: ${formData.musicFadeIn ? 'Yes' : 'No'}
Fade Out: ${formData.musicFadeOut ? 'Yes' : 'No'}
Selected Track: ${formData.selectedMusicTrack || 'None'}
Custom File: ${formData.customMusicFile || 'None'}

=====================================
SCRIPT
=====================================
${exportData.script}

=====================================
STORYBOARD (Scene-by-Scene)
=====================================
${exportData.storyboard.scenes.map((scene, i) => `Scene ${i + 1}: ${scene}`).join('\n')}

=====================================
ANIMATION PLAN
=====================================
${exportData.animationPlan.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

=====================================
EXPORT DETAILS
=====================================
Format: ${exportData.exportPlan.exportFormat}
Compression: ${exportData.exportPlan.compressionMethod}
Quality: ${exportData.exportPlan.qualityLevel}
Destination: ${exportData.exportPlan.outputDestination}

=====================================
SUBTITLES
=====================================
${exportData.subtitles.length > 0 ? exportData.subtitles.join('\n') : 'No subtitles'}

=====================================
ASSETS LIST
=====================================
- Character assets (${formData.characterStyle})
- Background assets (${formData.backgroundStyle})
- Voice recording (${formData.voiceType})
- Subtitle files (${formData.subtitlesEnabled ? 'Required' : 'Not required'})
- Animation keyframes
- Transition effects (${formData.transition})
- Motion effects (${formData.motionEffect ? 'Ken Burns' : 'None'})
- Music track (${formData.selectedMusicTrack || formData.customMusicFile || 'None'})
`;

      downloadTextFile(exportText, `video-plan-${Date.now()}.txt`);
      toast.success('Export downloaded successfully!');
    }
  };

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success(`${section} copied to clipboard!`);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
      console.error('Copy error:', err);
    }
  };

  const handleCustomMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, customMusicFile: file.name });
      toast.success(`Selected: ${file.name}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="text-center space-y-4 py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
          <Film className="h-4 w-4" />
          <span>AI Video Maker</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
          Create AI Video Plans
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          Generate complete video production plans with scripts, storyboards, animation, music, and photo timelines.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Input Form */}
        <Card className="shadow-sm border-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Video Details</CardTitle>
            <CardDescription>
              Configure your AI video production plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div className="space-y-2">
              <Label htmlFor="mode">Video Mode</Label>
              <Select
                value={formData.mode}
                onValueChange={(value: AIVideoMakerFormData['mode']) =>
                  setFormData({ ...formData, mode: value })
                }
              >
                <SelectTrigger id="mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2D Explainer">2D Explainer</SelectItem>
                  <SelectItem value="3D Animated Video">3D Animated Video</SelectItem>
                  <SelectItem value="Cartoon Animation">Cartoon Animation</SelectItem>
                  <SelectItem value="Whiteboard Animation">Whiteboard Animation</SelectItem>
                  <SelectItem value="Motion Graphics">Motion Graphics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Video Topic */}
            <div className="space-y-2">
              <Label htmlFor="videoTopic">Video Topic *</Label>
              <Input
                id="videoTopic"
                placeholder="e.g., How AI is Changing Education"
                value={formData.videoTopic}
                onChange={(e) => setFormData({ ...formData, videoTopic: e.target.value })}
              />
            </div>

            {/* Script Input */}
            <div className="space-y-2">
              <Label htmlFor="script">Script (optional - or generate below)</Label>
              <Textarea
                id="script"
                placeholder="Paste your script here or generate one..."
                value={formData.script}
                onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                rows={4}
              />
            </div>

            <Separator />

            {/* New Video Settings */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Video Settings</Label>
              
              {/* Short Video Length */}
              <div className="space-y-2">
                <Label htmlFor="shortVideoLength">Video Length</Label>
                <Select
                  value={formData.shortVideoLength}
                  onValueChange={(value: '10s' | '20s' | '30s' | '60s') =>
                    setFormData({ ...formData, shortVideoLength: value })
                  }
                >
                  <SelectTrigger id="shortVideoLength">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10s">10 seconds</SelectItem>
                    <SelectItem value="20s">20 seconds</SelectItem>
                    <SelectItem value="30s">30 seconds</SelectItem>
                    <SelectItem value="60s">60 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Video Format */}
              <div className="space-y-2">
                <Label htmlFor="videoFormat">Video Format</Label>
                <Select
                  value={formData.videoFormat}
                  onValueChange={(value: '9:16' | '16:9' | '1:1') =>
                    setFormData({ ...formData, videoFormat: value })
                  }
                >
                  <SelectTrigger id="videoFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:16">9:16 (Shorts/Reels)</SelectItem>
                    <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transitions */}
              <div className="space-y-2">
                <Label htmlFor="transition">Transitions</Label>
                <Select
                  value={formData.transition}
                  onValueChange={(value: 'smooth' | 'cinematic' | 'zoom-in' | 'slide' | 'fade') =>
                    setFormData({ ...formData, transition: value })
                  }
                >
                  <SelectTrigger id="transition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smooth">Smooth</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="zoom-in">Zoom In</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Motion Effect */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="motionEffect"
                  checked={formData.motionEffect}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, motionEffect: checked === true })
                  }
                />
                <Label htmlFor="motionEffect" className="text-sm font-normal cursor-pointer">
                  Motion effect (Ken Burns)
                </Label>
              </div>

              {/* Text Captions */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="textCaptions"
                  checked={formData.textCaptions}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, textCaptions: checked === true })
                  }
                />
                <Label htmlFor="textCaptions" className="text-sm font-normal cursor-pointer">
                  Text captions
                </Label>
              </div>

              {/* AI Voiceover */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="aiVoiceover"
                  checked={formData.aiVoiceoverEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, aiVoiceoverEnabled: checked === true })
                  }
                />
                <Label htmlFor="aiVoiceover" className="text-sm font-normal cursor-pointer">
                  AI voiceover (optional)
                </Label>
              </div>
            </div>

            <Separator />

            {/* Original Video Settings */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Style Settings</Label>

              <div className="space-y-2">
                <Label htmlFor="videoStyle">Video Style</Label>
                <Select
                  value={formData.videoStyle}
                  onValueChange={(value: AIVideoMakerFormData['videoStyle']) =>
                    setFormData({ ...formData, videoStyle: value })
                  }
                >
                  <SelectTrigger id="videoStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2D">2D Animation</SelectItem>
                    <SelectItem value="3D">3D Animation</SelectItem>
                    <SelectItem value="Cartoon">Cartoon</SelectItem>
                    <SelectItem value="Realistic">Realistic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="characterStyle">Character Style</Label>
                <Select
                  value={formData.characterStyle}
                  onValueChange={(value: AIVideoMakerFormData['characterStyle']) =>
                    setFormData({ ...formData, characterStyle: value })
                  }
                >
                  <SelectTrigger id="characterStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Robot">Robot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundStyle">Background Style</Label>
                <Select
                  value={formData.backgroundStyle}
                  onValueChange={(value: AIVideoMakerFormData['backgroundStyle']) =>
                    setFormData({ ...formData, backgroundStyle: value })
                  }
                >
                  <SelectTrigger id="backgroundStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Studio">Studio</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                    <SelectItem value="Abstract">Abstract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voiceType">Voice Type</Label>
                <Select
                  value={formData.voiceType}
                  onValueChange={(value: AIVideoMakerFormData['voiceType']) =>
                    setFormData({ ...formData, voiceType: value })
                  }
                >
                  <SelectTrigger id="voiceType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Robotic">Robotic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subtitles"
                  checked={formData.subtitlesEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, subtitlesEnabled: checked === true })
                  }
                />
                <Label htmlFor="subtitles" className="text-sm font-normal cursor-pointer">
                  Enable Subtitles
                </Label>
              </div>
            </div>

            <Separator />

            {/* Music Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Music Settings</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="musicEnabled"
                    checked={formData.musicEnabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, musicEnabled: checked === true })
                    }
                  />
                  <Label htmlFor="musicEnabled" className="text-sm font-normal cursor-pointer">
                    Enable Music
                  </Label>
                </div>
              </div>

              {formData.musicEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>Volume: {formData.musicVolume}%</Label>
                    <Slider
                      value={[formData.musicVolume]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, musicVolume: value[0] })
                      }
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Trim Start: {formData.musicTrimStart}%</Label>
                    <Slider
                      value={[formData.musicTrimStart]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, musicTrimStart: value[0] })
                      }
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Trim End: {formData.musicTrimEnd}%</Label>
                    <Slider
                      value={[formData.musicTrimEnd]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, musicTrimEnd: value[0] })
                      }
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="musicFadeIn"
                      checked={formData.musicFadeIn}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, musicFadeIn: checked === true })
                      }
                    />
                    <Label htmlFor="musicFadeIn" className="text-sm font-normal cursor-pointer">
                      Fade In
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="musicFadeOut"
                      checked={formData.musicFadeOut}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, musicFadeOut: checked === true })
                      }
                    />
                    <Label htmlFor="musicFadeOut" className="text-sm font-normal cursor-pointer">
                      Fade Out
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customMusic">Upload Custom Music</Label>
                    <div className="flex gap-2">
                      <Input
                        id="customMusic"
                        type="file"
                        accept="audio/*"
                        onChange={handleCustomMusicUpload}
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon" disabled>
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.customMusicFile && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {formData.customMusicFile}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleGenerateScript}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Film className="mr-2 h-4 w-4" />
                    Generate Script
                  </>
                )}
              </Button>

              <Button
                onClick={handleGenerateStoryboard}
                disabled={isGenerating}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Storyboard'
                )}
              </Button>

              <Button
                onClick={handleGenerateAnimationPlan}
                disabled={isGenerating}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Animation Plan'
                )}
              </Button>

              <Button
                onClick={handleExport}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Full Plan
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Output Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Music Library */}
          {formData.musicEnabled && (
            <Card className="shadow-sm border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Music Library
                </CardTitle>
                <CardDescription>
                  Browse and select background music for your video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MusicLibraryPanel
                  selectedTrack={formData.selectedMusicTrack}
                  onSelectTrack={(track) =>
                    setFormData({ ...formData, selectedMusicTrack: track })
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Photo Timeline Builder */}
          <Card className="shadow-sm border-2">
            <CardHeader>
              <CardTitle>Photo Timeline Builder</CardTitle>
              <CardDescription>
                Upload and arrange photos for your video timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PhotoTimelineBuilder
                photoOrder={photoOrder}
                onPhotoOrderChange={setPhotoOrder}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateVideo}
                  disabled={photoOrder.length === 0}
                  className="flex-1"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Generate Video Timeline
                </Button>
                <Button
                  onClick={handleDownloadMP4}
                  disabled={!videoTimeline}
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Script */}
          {generatedScript && (
            <Card className="shadow-sm border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Script</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(generatedScript, 'Script')}
                  >
                    {copiedSection === 'Script' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                    {generatedScript}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Storyboard */}
          {storyboard && (
            <Card className="shadow-sm border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Storyboard</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(storyboard.join('\n'), 'Storyboard')}
                  >
                    {copiedSection === 'Storyboard' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {storyboard.map((scene, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Scene {index + 1}
                      </p>
                      <p className="text-sm">{scene}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Animation Plan */}
          {animationPlan && (
            <Card className="shadow-sm border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Animation Plan</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(animationPlan.join('\n'), 'Animation Plan')}
                  >
                    {copiedSection === 'Animation Plan' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {animationPlan.map((step, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <p className="text-sm flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Timeline */}
          {videoTimeline && (
            <Card className="shadow-sm border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Video Timeline (Placeholder MP4)</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(videoTimeline, 'Video Timeline')}
                  >
                    {copiedSection === 'Video Timeline' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                    {videoTimeline}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Export */}
          {fullExport && (
            <Card className="shadow-sm border-2">
              <CardHeader>
                <CardTitle>Export Complete</CardTitle>
                <CardDescription>
                  Your full video plan has been downloaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Video plan exported successfully! Check your downloads folder.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
