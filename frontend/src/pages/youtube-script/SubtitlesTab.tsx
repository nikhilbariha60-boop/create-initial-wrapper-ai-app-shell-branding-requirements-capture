import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Subtitles, Copy, CheckCircle2, Download } from 'lucide-react';
import { useSubtitlesGenerator } from '../../hooks/useSubtitlesGenerator';
import { toast } from 'sonner';
import { LANGUAGES } from '../../constants/languages';
import { SubtitleStyle } from '../../backend';
import { downloadTextFile } from '../../utils/downloadTextFile';

interface SubtitlesTabProps {
  scriptFromScriptTab: string | null;
  voiceoverFromVoiceoverTab: string | null;
}

export default function SubtitlesTab({ scriptFromScriptTab, voiceoverFromVoiceoverTab }: SubtitlesTabProps) {
  const { generateSubtitles, isGenerating, error } = useSubtitlesGenerator();
  
  const [sourceType, setSourceType] = useState<'script' | 'voiceover' | 'paste'>('script');
  const [pastedText, setPastedText] = useState('');
  const [language, setLanguage] = useState('en');
  const [style, setStyle] = useState<SubtitleStyle>(SubtitleStyle.simple);
  
  const [generatedSubtitles, setGeneratedSubtitles] = useState<{ normal: string; srt: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    let sourceText = '';
    
    if (sourceType === 'script') {
      sourceText = scriptFromScriptTab || '';
    } else if (sourceType === 'voiceover') {
      sourceText = voiceoverFromVoiceoverTab || '';
    } else {
      sourceText = pastedText;
    }
    
    if (!sourceText.trim()) {
      toast.error('Please provide source text');
      return;
    }

    const result = await generateSubtitles({
      script: sourceText,
      language,
      style,
    });

    if (result) {
      setGeneratedSubtitles(result);
      toast.success('Subtitles generated successfully!');
    }
  };

  const handleCopy = async () => {
    if (!generatedSubtitles) return;

    const combinedText = `NORMAL SUBTITLES:\n\n${generatedSubtitles.normal}\n\n\nSRT FORMAT:\n\n${generatedSubtitles.srt}`;

    try {
      await navigator.clipboard.writeText(combinedText);
      setIsCopied(true);
      toast.success('Subtitles copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy subtitles');
      console.error('Copy error:', err);
    }
  };

  const handleDownloadSRT = () => {
    if (!generatedSubtitles) return;
    
    downloadTextFile(generatedSubtitles.srt, `subtitles-${Date.now()}.srt`);
    toast.success('SRT file downloaded!');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Input Form */}
      <Card className="shadow-sm border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Subtitle Settings</CardTitle>
          <CardDescription>
            Configure subtitle generation settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Type */}
          <div className="space-y-2">
            <Label htmlFor="sourceType">Source Text</Label>
            <Select
              value={sourceType}
              onValueChange={(value: 'script' | 'voiceover' | 'paste') => setSourceType(value)}
            >
              <SelectTrigger id="sourceType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="script">Use Script from Script Tab</SelectItem>
                <SelectItem value="voiceover">Use Voiceover from Voiceover Tab</SelectItem>
                <SelectItem value="paste">Paste Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Paste Text Area */}
          {sourceType === 'paste' && (
            <div className="space-y-2">
              <Label htmlFor="pastedText">Paste Your Text</Label>
              <Textarea
                id="pastedText"
                placeholder="Paste your text here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={6}
              />
            </div>
          )}

          {/* Show Source Preview */}
          {sourceType === 'script' && scriptFromScriptTab && (
            <div className="space-y-2">
              <Label>Script Preview</Label>
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                {scriptFromScriptTab.substring(0, 200)}...
              </div>
            </div>
          )}

          {sourceType === 'voiceover' && voiceoverFromVoiceoverTab && (
            <div className="space-y-2">
              <Label>Voiceover Preview</Label>
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                {voiceoverFromVoiceoverTab.substring(0, 200)}...
              </div>
            </div>
          )}

          {((sourceType === 'script' && !scriptFromScriptTab) || (sourceType === 'voiceover' && !voiceoverFromVoiceoverTab)) && (
            <Alert>
              <AlertDescription>
                No {sourceType} available. Please generate one first or paste text.
              </AlertDescription>
            </Alert>
          )}

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Subtitle Language</Label>
            <Select
              value={language}
              onValueChange={setLanguage}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label htmlFor="style">Subtitle Style</Label>
            <Select
              value={style}
              onValueChange={(value: SubtitleStyle) => setStyle(value)}
            >
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SubtitleStyle.simple}>Simple</SelectItem>
                <SelectItem value={SubtitleStyle.bold}>Bold</SelectItem>
                <SelectItem value={SubtitleStyle.mrbeastStyle}>MrBeast Style</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || 
              (sourceType === 'script' && !scriptFromScriptTab) || 
              (sourceType === 'voiceover' && !voiceoverFromVoiceoverTab) || 
              (sourceType === 'paste' && !pastedText.trim())}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Subtitles...
              </>
            ) : (
              <>
                <Subtitles className="h-4 w-4 mr-2" />
                Generate Subtitles
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Subtitles Output */}
      <Card className="shadow-sm border-2">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-2xl">Generated Subtitles</CardTitle>
              <CardDescription>
                Your subtitle output
              </CardDescription>
            </div>
            {generatedSubtitles && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSRT}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download SRT
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!generatedSubtitles ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Subtitles className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  No subtitles generated yet
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Configure settings and click "Generate Subtitles" to create your subtitles
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
              {/* Normal Subtitles */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Normal Subtitles
                </h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {generatedSubtitles.normal}
                </div>
              </div>

              {/* SRT Format */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  SRT Format
                </h3>
                <div className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-muted p-4 rounded-md leading-relaxed">
                  {generatedSubtitles.srt}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
