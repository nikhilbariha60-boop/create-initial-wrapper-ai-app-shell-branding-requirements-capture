import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mic, Copy, CheckCircle2 } from 'lucide-react';
import { useVoiceoverGenerator } from '../../hooks/useVoiceoverGenerator';
import { toast } from 'sonner';
import { LANGUAGES } from '../../constants/languages';
import { VoiceGender, VoiceSpeed, Emotion } from '../../backend';

interface VoiceoverTabProps {
  scriptFromScriptTab: string | null;
  onVoiceoverGenerated: (voiceover: string) => void;
}

export default function VoiceoverTab({ scriptFromScriptTab, onVoiceoverGenerated }: VoiceoverTabProps) {
  const { generateVoiceover, isGenerating, error } = useVoiceoverGenerator();
  
  const [scriptSource, setScriptSource] = useState<'paste' | 'reuse'>('reuse');
  const [pastedScript, setPastedScript] = useState('');
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(VoiceGender.male);
  const [language, setLanguage] = useState('en');
  const [speed, setSpeed] = useState<VoiceSpeed>(VoiceSpeed.normal);
  const [emotion, setEmotion] = useState<Emotion>(Emotion.normal);
  
  const [generatedVoiceover, setGeneratedVoiceover] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    const scriptToUse = scriptSource === 'reuse' ? scriptFromScriptTab : pastedScript;
    
    if (!scriptToUse || !scriptToUse.trim()) {
      toast.error('Please provide a script');
      return;
    }

    const result = await generateVoiceover({
      script: scriptToUse,
      voiceGender,
      language,
      speed,
      emotion,
    });

    if (result) {
      setGeneratedVoiceover(result);
      onVoiceoverGenerated(result);
      toast.success('Voiceover generated successfully!');
    }
  };

  const handleCopy = async () => {
    if (!generatedVoiceover) return;

    try {
      await navigator.clipboard.writeText(generatedVoiceover);
      setIsCopied(true);
      toast.success('Voiceover copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy voiceover');
      console.error('Copy error:', err);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Input Form */}
      <Card className="shadow-sm border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Voiceover Settings</CardTitle>
          <CardDescription>
            Configure voiceover generation settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Script Source */}
          <div className="space-y-2">
            <Label htmlFor="scriptSource">Script Source</Label>
            <Select
              value={scriptSource}
              onValueChange={(value: 'paste' | 'reuse') => setScriptSource(value)}
            >
              <SelectTrigger id="scriptSource">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reuse">Use Script from Script Tab</SelectItem>
                <SelectItem value="paste">Paste Script</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Paste Script Area */}
          {scriptSource === 'paste' && (
            <div className="space-y-2">
              <Label htmlFor="pastedScript">Paste Your Script</Label>
              <Textarea
                id="pastedScript"
                placeholder="Paste your script here..."
                value={pastedScript}
                onChange={(e) => setPastedScript(e.target.value)}
                rows={6}
              />
            </div>
          )}

          {/* Show Script Preview if Reusing */}
          {scriptSource === 'reuse' && scriptFromScriptTab && (
            <div className="space-y-2">
              <Label>Script Preview</Label>
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                {scriptFromScriptTab.substring(0, 200)}...
              </div>
            </div>
          )}

          {scriptSource === 'reuse' && !scriptFromScriptTab && (
            <Alert>
              <AlertDescription>
                No script available from Script tab. Please generate a script first or paste one.
              </AlertDescription>
            </Alert>
          )}

          {/* Voice Gender */}
          <div className="space-y-2">
            <Label htmlFor="voiceGender">Voice Gender</Label>
            <Select
              value={voiceGender}
              onValueChange={(value: VoiceGender) => setVoiceGender(value)}
            >
              <SelectTrigger id="voiceGender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VoiceGender.male}>Male</SelectItem>
                <SelectItem value={VoiceGender.female}>Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
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

          {/* Speed */}
          <div className="space-y-2">
            <Label htmlFor="speed">Speed</Label>
            <Select
              value={speed}
              onValueChange={(value: VoiceSpeed) => setSpeed(value)}
            >
              <SelectTrigger id="speed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VoiceSpeed.slow}>Slow</SelectItem>
                <SelectItem value={VoiceSpeed.normal}>Normal</SelectItem>
                <SelectItem value={VoiceSpeed.fast}>Fast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Emotion */}
          <div className="space-y-2">
            <Label htmlFor="emotion">Emotion</Label>
            <Select
              value={emotion}
              onValueChange={(value: Emotion) => setEmotion(value)}
            >
              <SelectTrigger id="emotion">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Emotion.normal}>Normal</SelectItem>
                <SelectItem value={Emotion.energetic}>Energetic</SelectItem>
                <SelectItem value={Emotion.serious}>Serious</SelectItem>
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
            disabled={isGenerating || (scriptSource === 'reuse' && !scriptFromScriptTab) || (scriptSource === 'paste' && !pastedScript.trim())}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Voiceover...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Generate Voiceover
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Voiceover Output */}
      <Card className="shadow-sm border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Generated Voiceover</CardTitle>
              <CardDescription>
                Your voiceover text output
              </CardDescription>
            </div>
            {generatedVoiceover && (
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
                    Copy Voiceover
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!generatedVoiceover ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Mic className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  No voiceover generated yet
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Configure settings and click "Generate Voiceover" to create your voiceover text
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {generatedVoiceover}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
