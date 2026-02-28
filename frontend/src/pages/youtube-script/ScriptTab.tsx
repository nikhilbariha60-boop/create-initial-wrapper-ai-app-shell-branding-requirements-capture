import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, Copy, AlertCircle, Coins } from 'lucide-react';
import { useYouTubeScript, YouTubeScriptFormData } from '../../hooks/useYouTubeScript';
import { parseYouTubeScript } from '../../utils/parseYouTubeScript';
import { LANGUAGES } from '../../constants/languages';
import { toast } from 'sonner';
import { CoinPurchaseDialog } from '../../components/CoinPurchaseDialog';

interface ScriptTabProps {
  onScriptGenerated?: (script: string) => void;
}

export default function ScriptTab({ onScriptGenerated }: ScriptTabProps) {
  const { generateScript, isGenerating, error, insufficientCoins } = useYouTubeScript();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const [formData, setFormData] = useState<YouTubeScriptFormData>({
    topic: '',
    scriptLanguage: 'en',
    voiceLanguage: 'en',
    subtitleLanguage: 'en',
    autoTranslate: false,
    length: '5',
    tone: 'Serious',
    targetAudience: '',
    includeTimestamps: true,
    includeVoiceoverLines: false,
  });

  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a video topic');
      return;
    }

    const script = await generateScript(formData);
    if (script) {
      setGeneratedScript(script);
      onScriptGenerated?.(script);
      toast.success('Script generated successfully!');
    }
  };

  const handleCopy = async () => {
    if (!generatedScript) return;
    try {
      await navigator.clipboard.writeText(generatedScript);
      toast.success('Script copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy script');
    }
  };

  const parsedScript = generatedScript ? parseYouTubeScript(generatedScript) : null;

  return (
    <div className="space-y-6">
      {/* Insufficient Coins Alert */}
      {insufficientCoins && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPurchaseDialogOpen(true)}
              className="flex-shrink-0"
            >
              <Coins className="h-4 w-4 mr-2" />
              Buy Coins
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Input Form */}
      <Card className="shadow-sm border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Script Configuration
          </CardTitle>
          <CardDescription>
            Configure your YouTube video script settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">Video Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., How to Build a Successful YouTube Channel"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              disabled={isGenerating}
            />
          </div>

          {/* Languages */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scriptLanguage">Script Language</Label>
              <Select
                value={formData.scriptLanguage}
                onValueChange={(value) => setFormData({ ...formData, scriptLanguage: value })}
                disabled={isGenerating}
              >
                <SelectTrigger id="scriptLanguage">
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
            <div className="space-y-2">
              <Label htmlFor="voiceLanguage">Voice Language</Label>
              <Select
                value={formData.voiceLanguage}
                onValueChange={(value) => setFormData({ ...formData, voiceLanguage: value })}
                disabled={isGenerating}
              >
                <SelectTrigger id="voiceLanguage">
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
            <div className="space-y-2">
              <Label htmlFor="subtitleLanguage">Subtitle Language</Label>
              <Select
                value={formData.subtitleLanguage}
                onValueChange={(value) => setFormData({ ...formData, subtitleLanguage: value })}
                disabled={isGenerating}
              >
                <SelectTrigger id="subtitleLanguage">
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
          </div>

          {/* Video Settings */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Video Length</Label>
              <Select
                value={formData.length}
                onValueChange={(value: any) => setFormData({ ...formData, length: value })}
                disabled={isGenerating}
              >
                <SelectTrigger id="length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={formData.tone}
                onValueChange={(value: any) => setFormData({ ...formData, tone: value })}
                disabled={isGenerating}
              >
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Funny">Funny</SelectItem>
                  <SelectItem value="Serious">Serious</SelectItem>
                  <SelectItem value="Motivational">Motivational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Beginners"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label htmlFor="autoTranslate" className="text-sm font-medium">
                Auto-translate script
              </Label>
              <Switch
                id="autoTranslate"
                checked={formData.autoTranslate}
                onCheckedChange={(checked) => setFormData({ ...formData, autoTranslate: checked })}
                disabled={isGenerating}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label htmlFor="includeTimestamps" className="text-sm font-medium">
                Include timestamps
              </Label>
              <Switch
                id="includeTimestamps"
                checked={formData.includeTimestamps}
                onCheckedChange={(checked) => setFormData({ ...formData, includeTimestamps: checked })}
                disabled={isGenerating}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label htmlFor="includeVoiceoverLines" className="text-sm font-medium">
                Include voiceover lines
              </Label>
              <Switch
                id="includeVoiceoverLines"
                checked={formData.includeVoiceoverLines}
                onCheckedChange={(checked) => setFormData({ ...formData, includeVoiceoverLines: checked })}
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.topic.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Script...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Script
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Script Output */}
      {parsedScript && (
        <Card className="shadow-sm border-2">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Generated Script</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Script
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {parsedScript.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                <div className="space-y-1">
                  {section.content.map((line, lineIndex) => (
                    <p key={lineIndex} className="text-sm text-muted-foreground leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Coin Purchase Dialog */}
      <CoinPurchaseDialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen} />
    </div>
  );
}
