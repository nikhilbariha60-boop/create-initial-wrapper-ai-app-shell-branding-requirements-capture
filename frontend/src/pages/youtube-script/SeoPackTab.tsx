import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, Copy, CheckCircle2 } from 'lucide-react';
import { useSeoPackGenerator } from '../../hooks/useSeoPackGenerator';
import { toast } from 'sonner';
import type { SeoPackResponse } from '../../backend';

export default function SeoPackTab() {
  const { generateSeoPack, isGenerating, error } = useSeoPackGenerator();
  
  const [videoTitle, setVideoTitle] = useState('');
  const [mainTopic, setMainTopic] = useState('');
  const [generatedSeoPack, setGeneratedSeoPack] = useState<SeoPackResponse | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    if (!videoTitle.trim() || !mainTopic.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await generateSeoPack({
      videoTitle,
      mainTopic,
    });

    if (result) {
      setGeneratedSeoPack(result);
      toast.success('SEO Pack generated successfully!');
    }
  };

  const handleCopyAll = async () => {
    if (!generatedSeoPack) return;

    const combinedText = `SEO TITLES (10):
${generatedSeoPack.titles.map((title, i) => `${i + 1}. ${title}`).join('\n')}

DESCRIPTION:
${generatedSeoPack.description}

TAGS:
${generatedSeoPack.tags.join(', ')}

HASHTAGS:
${generatedSeoPack.hashtags.join(' ')}

PINNED COMMENT:
${generatedSeoPack.pinnedComment}

CHAPTERS/TIMESTAMPS (Optional):
${generatedSeoPack.chapters.join('\n')}`;

    try {
      await navigator.clipboard.writeText(combinedText);
      setIsCopied(true);
      toast.success('SEO Pack copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy SEO Pack');
      console.error('Copy error:', err);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Input Form */}
      <Card className="shadow-sm border-2">
        <CardHeader>
          <CardTitle className="text-2xl">SEO Pack Settings</CardTitle>
          <CardDescription>
            Generate comprehensive SEO content for your YouTube video
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Title */}
          <div className="space-y-2">
            <Label htmlFor="videoTitle">Video Title *</Label>
            <Input
              id="videoTitle"
              placeholder="e.g., Ultimate Guide to YouTube Success"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
          </div>

          {/* Main Topic */}
          <div className="space-y-2">
            <Label htmlFor="mainTopic">Main Topic *</Label>
            <Input
              id="mainTopic"
              placeholder="e.g., YouTube Growth Strategies"
              value={mainTopic}
              onChange={(e) => setMainTopic(e.target.value)}
            />
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
            disabled={isGenerating || !videoTitle.trim() || !mainTopic.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating SEO Pack...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate SEO Pack
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated SEO Pack Output */}
      <Card className="shadow-sm border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Generated SEO Pack</CardTitle>
              <CardDescription>
                Your complete YouTube SEO content
              </CardDescription>
            </div>
            {generatedSeoPack && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!generatedSeoPack ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  No SEO Pack generated yet
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Fill in the form and click "Generate SEO Pack" to create your YouTube SEO content
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
              {/* Titles */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  SEO Titles (10)
                </h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  {generatedSeoPack.titles.map((title, i) => (
                    <li key={i} className="leading-relaxed">{title}</li>
                  ))}
                </ol>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Description
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {generatedSeoPack.description}
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {generatedSeoPack.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Hashtags
                </h3>
                <p className="text-sm text-muted-foreground">
                  {generatedSeoPack.hashtags.join(' ')}
                </p>
              </div>

              {/* Pinned Comment */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Pinned Comment
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {generatedSeoPack.pinnedComment}
                </p>
              </div>

              {/* Chapters */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Chapters/Timestamps (Optional)
                </h3>
                <div className="text-sm text-muted-foreground space-y-1 font-mono">
                  {generatedSeoPack.chapters.map((chapter, i) => (
                    <p key={i}>{chapter}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
