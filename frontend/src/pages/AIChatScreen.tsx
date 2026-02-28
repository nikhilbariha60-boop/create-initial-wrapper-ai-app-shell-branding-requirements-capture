import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles, Paperclip, X, Download, ExternalLink, Coins, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { useChat, AttachmentData, GROQ_API_KEY_STORAGE_KEY, resolveGroqApiKey } from '../hooks/useChat';
import { ChatRole, Message } from '../backend';
import {
  fileToUint8Array,
  uint8ArrayToBlobUrl,
  revokeBlobUrl,
  getImageDimensions,
} from '../utils/imageAttachment';
import { toast } from 'sonner';
import { CoinPurchaseDialog } from '../components/CoinPurchaseDialog';

function ApiKeySetup({ onKeySaved }: { onKeySaved: () => void }) {
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const validateAndSave = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setKeyError('Please enter your Groq API key.');
      return;
    }
    if (!trimmed.startsWith('gsk_')) {
      setKeyError('Invalid API key format. Groq keys start with "gsk_".');
      return;
    }
    if (trimmed.length < 20) {
      setKeyError('API key appears too short. Please check and try again.');
      return;
    }
    setKeyError(null);
    localStorage.setItem(GROQ_API_KEY_STORAGE_KEY, trimmed);
    setSaved(true);
    toast.success('API key saved successfully!');
    setTimeout(() => {
      onKeySaved();
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      validateAndSave();
    }
  };

  return (
    <Card className="shadow-lg border-2 border-primary/30 bg-primary/5">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Groq API Key Required</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enter your Groq API key to start chatting. Get a free key at{' '}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80"
              >
                console.groq.com
              </a>
              .
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="gsk_..."
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                if (keyError) setKeyError(null);
              }}
              onKeyDown={handleKeyDown}
              className={`flex-1 font-mono text-sm ${keyError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              disabled={saved}
            />
            <Button
              onClick={validateAndSave}
              disabled={saved || !keyInput.trim()}
              className="flex-shrink-0"
            >
              {saved ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                'Save Key'
              )}
            </Button>
          </div>
          {keyError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {keyError}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Your key is stored locally in your browser and never sent to our servers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AIChatScreen() {
  const [prompt, setPrompt] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => !!resolveGroqApiKey());
  const [showChangeKey, setShowChangeKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading, validationError, insufficientCoins, apiKeyMissing, clearValidationError } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up preview URL on unmount or when attachment changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        revokeBlobUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  // Show validation errors as toast (non-coin, non-apikey errors)
  useEffect(() => {
    if (validationError && !insufficientCoins && !apiKeyMissing) {
      toast.error(validationError);
      clearValidationError();
    }
  }, [validationError, insufficientCoins, apiKeyMissing, clearValidationError]);

  // If apiKeyMissing flag is set, show the key setup panel
  useEffect(() => {
    if (apiKeyMissing) {
      setHasApiKey(false);
    }
  }, [apiKeyMissing]);

  const handleKeySaved = () => {
    setHasApiKey(true);
    setShowChangeKey(false);
    clearValidationError();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const bytes = await fileToUint8Array(file);
      const { width, height } = await getImageDimensions(file);
      const url = URL.createObjectURL(file);

      if (previewUrl) {
        revokeBlobUrl(previewUrl);
      }

      setSelectedAttachment({ file, bytes, width, height });
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    if (previewUrl) {
      revokeBlobUrl(previewUrl);
    }
    setSelectedAttachment(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!prompt.trim() && !selectedAttachment) || isLoading) return;

    await sendMessage(prompt, selectedAttachment || undefined);
    setPrompt('');
    handleRemoveAttachment();
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          <span>AI Chat Assistant</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Chat with AI
        </h2>
        <p className="text-muted-foreground">
          Ask questions and get instant responses from your AI assistant
        </p>
      </div>

      {/* API Key Setup — shown when no key or key is invalid */}
      {(!hasApiKey || showChangeKey) && (
        <ApiKeySetup onKeySaved={handleKeySaved} />
      )}

      {/* Change key link when key is already set */}
      {hasApiKey && !showChangeKey && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowChangeKey(true)}
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            <Key className="h-3 w-3" />
            Change API Key
          </button>
        </div>
      )}

      {/* Insufficient Coins Alert */}
      {insufficientCoins && validationError && (
        <Card className="shadow-sm border-2 border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-sm text-destructive font-medium mb-2">{validationError}</p>
                <p className="text-xs text-muted-foreground">
                  Each chat message costs 20 coins. Purchase more coins to continue chatting.
                </p>
              </div>
              <Button
                onClick={() => setPurchaseDialogOpen(true)}
                size="sm"
                className="flex-shrink-0"
              >
                <Coins className="h-4 w-4 mr-2" />
                Buy Coins
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Container */}
      <Card className="shadow-lg border-2">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea className="h-[400px] sm:h-[500px] p-4 sm:p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">Start a conversation</p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {hasApiKey
                      ? 'Type your message below and press send to begin chatting with your AI assistant.'
                      : 'Enter your Groq API key above to start chatting.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-muted">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4 sm:p-6">
            {/* Attachment Preview */}
            {selectedAttachment && previewUrl && (
              <div className="mb-3 p-3 bg-muted rounded-lg flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Attachment preview"
                  className="h-16 w-16 object-cover rounded border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedAttachment.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedAttachment.file.size / 1024).toFixed(1)} KB •{' '}
                    {selectedAttachment.width} × {selectedAttachment.height}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveAttachment}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
                onClick={handleAttachClick}
                disabled={isLoading || !hasApiKey}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={hasApiKey ? 'Type your message here...' : 'Enter your API key above to start chatting...'}
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading || !hasApiKey}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
                disabled={(!prompt.trim() && !selectedAttachment) || isLoading || !hasApiKey}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Coin Purchase Dialog */}
      <CoinPurchaseDialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen} />
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const isUser = message.role === ChatRole.user;
  const isError = !isUser && message.content.startsWith('⚠️');

  useEffect(() => {
    if (message.imageBytes) {
      const url = uint8ArrayToBlobUrl(
        new Uint8Array(message.imageBytes),
        'image/jpeg'
      );
      setImageUrl(url);

      return () => {
        revokeBlobUrl(url);
      };
    }
  }, [message.imageBytes]);

  const handleOpenImage = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  const handleDownloadImage = () => {
    if (imageUrl) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = 'attachment.jpg';
      a.click();
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isError ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          <Bot className={`h-4 w-4 ${isError ? 'text-destructive' : 'text-primary'}`} />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : isError
            ? 'bg-destructive/10 border border-destructive/30 text-destructive'
            : 'bg-muted text-foreground'
        }`}
      >
        {imageUrl && (
          <div className="mb-2 relative group">
            <img
              src={imageUrl}
              alt="Attached image"
              className="max-w-full rounded-lg max-h-48 object-contain"
            />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleOpenImage}
                className="h-7 w-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5 text-white" />
              </button>
              <button
                onClick={handleDownloadImage}
                className="h-7 w-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                title="Download"
              >
                <Download className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {new Date(Number(message.timestamp)).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}
