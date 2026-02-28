import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Check, Share2 } from 'lucide-react';
import { SiWhatsapp, SiFacebook, SiX } from 'react-icons/si';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function LinkShare() {
  const [copied, setCopied] = useState(false);

  const getUrl = () => window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = getUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(getUrl())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(getUrl())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <TooltipProvider>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                aria-label="Share this page"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden xl:inline text-sm">Share</span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Share this page</TooltipContent>
        </Tooltip>

        <PopoverContent className="w-56 p-3" align="end">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Share this page
          </p>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors text-left"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className={copied ? 'text-green-600 font-medium' : ''}>
              {copied ? 'Copied!' : 'Copy Link'}
            </span>
          </button>

          <div className="my-2 border-t" />

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors text-left"
          >
            <SiWhatsapp className="h-4 w-4 text-[#25D366] shrink-0" />
            <span>WhatsApp</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebook}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors text-left"
          >
            <SiFacebook className="h-4 w-4 text-[#1877F2] shrink-0" />
            <span>Facebook</span>
          </button>

          {/* Twitter / X */}
          <button
            onClick={handleTwitter}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors text-left"
          >
            <SiX className="h-4 w-4 shrink-0" />
            <span>Twitter / X</span>
          </button>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
