import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScriptTab from './youtube-script/ScriptTab';
import VoiceoverTab from './youtube-script/VoiceoverTab';
import SubtitlesTab from './youtube-script/SubtitlesTab';
import SeoPackTab from './youtube-script/SeoPackTab';
import { Video } from 'lucide-react';

export default function YouTubeScriptScreen() {
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [generatedVoiceover, setGeneratedVoiceover] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="text-center space-y-4 py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Video className="h-4 w-4" />
          <span>YouTube Script Generator</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
          Create Professional YouTube Content
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          Generate scripts, voiceovers, subtitles, and SEO packs for your YouTube videos.
        </p>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="script" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="voiceover">Voiceover</TabsTrigger>
          <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
          <TabsTrigger value="seo">SEO Pack</TabsTrigger>
        </TabsList>

        <TabsContent value="script">
          <ScriptTab onScriptGenerated={setGeneratedScript} />
        </TabsContent>

        <TabsContent value="voiceover">
          <VoiceoverTab 
            scriptFromScriptTab={generatedScript} 
            onVoiceoverGenerated={setGeneratedVoiceover}
          />
        </TabsContent>

        <TabsContent value="subtitles">
          <SubtitlesTab 
            scriptFromScriptTab={generatedScript}
            voiceoverFromVoiceoverTab={generatedVoiceover}
          />
        </TabsContent>

        <TabsContent value="seo">
          <SeoPackTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
