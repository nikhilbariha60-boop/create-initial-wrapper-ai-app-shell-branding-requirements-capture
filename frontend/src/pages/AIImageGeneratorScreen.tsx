import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ImageIcon, Download, Sparkles, Coins, AlertCircle } from 'lucide-react';
import { useAIImageGenerator } from '../hooks/useAIImageGenerator';
import { useCoinBalance } from '../hooks/useCoinBalance';
import { CoinPurchaseDialog } from '../components/CoinPurchaseDialog';
import { IMAGE_GENERATION_COST } from '../constants/coins';
import { downloadImageFile } from '../utils/downloadImageFile';

export default function AIImageGeneratorScreen() {
  const [prompt, setPrompt] = useState('');
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  
  const { generateImage, isGenerating, error, generatedImage, insufficientCoins } = useAIImageGenerator();
  const { data: coinBalance, isLoading: balanceLoading } = useCoinBalance();

  const balance = coinBalance ?? 0;
  const canGenerate = balance >= IMAGE_GENERATION_COST && prompt.trim().length > 0;
  const isOutOfCoins = balance === 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
    if (balance < IMAGE_GENERATION_COST) {
      setShowPurchaseDialog(true);
      return;
    }

    await generateImage({ prompt: prompt.trim() });
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const filename = `ai-generated-${Date.now()}.png`;
    downloadImageFile(generatedImage, filename);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canGenerate && !isGenerating) {
      handleGenerate();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          <span>AI Image Generator</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Create Stunning Images in Seconds
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Simply describe your idea and let AI create a professional, high-quality image
        </p>
      </div>

      {/* Coin Balance Display */}
      <Card className="shadow-sm border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-medium">Your Balance:</span>
              {balanceLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-lg font-bold text-primary">{balance} coins</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Cost per image: <span className="font-semibold text-foreground">{IMAGE_GENERATION_COST} coins</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Out of Coins Alert */}
      {isOutOfCoins && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-destructive font-medium">
              Please recharge to generate more images
            </span>
            <Button
              size="sm"
              onClick={() => setShowPurchaseDialog(true)}
              className="ml-4"
            >
              Buy Coins
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Insufficient Coins Alert */}
      {insufficientCoins && !isOutOfCoins && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-destructive font-medium">
              Insufficient coins. You need at least {IMAGE_GENERATION_COST} coins to generate an image.
            </span>
            <Button
              size="sm"
              onClick={() => setShowPurchaseDialog(true)}
              className="ml-4"
            >
              Buy Coins
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Generation Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Generate Your Image
          </CardTitle>
          <CardDescription>
            Describe your idea and we'll automatically enhance it with professional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Field */}
          <div className="space-y-2">
            <Input
              placeholder="Enter your idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isGenerating || isOutOfCoins}
              className="text-base h-12"
            />
            <p className="text-xs text-muted-foreground">
              Example: "A futuristic city at sunset" or "A cute cat wearing sunglasses"
            </p>
          </div>

          {/* Error Display */}
          {error && !insufficientCoins && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating || isOutOfCoins}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating your masterpiece...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Image ({IMAGE_GENERATION_COST} coins)
              </>
            )}
          </Button>

          {/* Generated Image Display */}
          {generatedImage && (
            <div className="space-y-4 pt-4 border-t">
              <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border">
                <img
                  src={generatedImage}
                  alt="Generated AI Image"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full h-12 text-base"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Image
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && !generatedImage && (
            <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center space-y-4 p-6">
                <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Creating your masterpiece...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take a few moments
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!generatedImage && !isGenerating && (
            <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center space-y-2 p-6">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Enter your idea above and click Generate Image
                </p>
                <p className="text-xs text-muted-foreground">
                  Your image will appear here with professional quality
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="shadow-sm bg-muted/50">
        <CardContent className="py-4">
          <div className="space-y-2 text-sm">
            <p className="font-medium">✨ Auto-Enhanced Generation</p>
            <p className="text-muted-foreground">
              Every image is automatically enhanced with: Ultra high quality, 4K resolution, 
              professional lighting, cinematic style, sharp focus, and masterpiece-level detail.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Coin Purchase Dialog */}
      <CoinPurchaseDialog
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
      />
    </div>
  );
}
