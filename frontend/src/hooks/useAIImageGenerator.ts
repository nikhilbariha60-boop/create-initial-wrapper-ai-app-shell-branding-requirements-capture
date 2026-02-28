import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useCoinBalance } from './useCoinBalance';
import { coinQueryKeys } from './coinQueryKeys';
import { isInsufficientCoinsError } from '../utils/coinErrors';
import { IMAGE_GENERATION_COST } from '../constants/coins';

/**
 * AI Image Generation API Configuration
 * 
 * IMPORTANT: Replace these placeholder values with your actual API credentials
 * 
 * Supported APIs:
 * - Stability AI: https://platform.stability.ai/docs/api-reference
 * - Replicate: https://replicate.com/docs/reference/http
 * - Hugging Face: https://huggingface.co/docs/api-inference/index
 * 
 * Example for Stability AI:
 * const API_ENDPOINT_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
 * const API_AUTH_KEY = 'sk-your-api-key-here';
 * 
 * Example for Replicate:
 * const API_ENDPOINT_URL = 'https://api.replicate.com/v1/predictions';
 * const API_AUTH_KEY = 'r8_your-api-key-here';
 */
const API_ENDPOINT_URL = 'YOUR_API_ENDPOINT_HERE'; // Replace with your actual API endpoint
const API_AUTH_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key

interface ImageGenerationRequest {
  prompt: string;
}

export function useAIImageGenerator() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: coinBalance } = useCoinBalance();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [insufficientCoins, setInsufficientCoins] = useState(false);

  const mutation = useMutation({
    mutationFn: async (request: ImageGenerationRequest) => {
      if (!actor) throw new Error('Actor not available');

      // Check coin balance before generation
      const balance = coinBalance ?? 0;
      if (balance < IMAGE_GENERATION_COST) {
        throw new Error('Insufficient coins. You need at least 10 coins to generate an image.');
      }

      // Auto-enhance the user's prompt with professional settings
      const enhancedPrompt = `${request.prompt}, Ultra high quality, 4K, professional, detailed, cinematic lighting, sharp focus, masterpiece`;

      // Call backend to charge coins
      await actor.submitImageGenerationParams({
        prompt: enhancedPrompt,
        negativePrompt: 'blurry, low quality, distorted, watermark, text, logo, noise, artifacts',
        seed: BigInt(Math.floor(Math.random() * 1000000)),
        steps: BigInt(30),
        guidanceScale: 7.5,
        samplerMethod: 'DPM++ 2M Karras',
        model: 'stable-diffusion-xl',
        imageBase64: '',
      });

      // Call external AI image generation API
      try {
        const response = await fetch(API_ENDPOINT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_AUTH_KEY}`,
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            negative_prompt: 'blurry, low quality, distorted, watermark, text, logo, noise, artifacts',
            width: 1024,
            height: 1024,
            steps: 30,
            guidance_scale: 7.5,
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Parse response based on API provider
        // This is a generic example - adjust based on your API's response format
        let imageUrl: string;
        
        if (data.artifacts && data.artifacts[0]?.base64) {
          // Stability AI format
          imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`;
        } else if (data.output && Array.isArray(data.output)) {
          // Replicate format
          imageUrl = data.output[0];
        } else if (data.images && data.images[0]) {
          // Generic format
          imageUrl = data.images[0];
        } else {
          throw new Error('Unexpected API response format');
        }

        return imageUrl;
      } catch (apiError: any) {
        // If API call fails, provide a helpful error message
        console.error('Image generation API error:', apiError);
        throw new Error(
          'Image generation failed. Please check your API configuration in useAIImageGenerator.ts. ' +
          'Make sure API_ENDPOINT_URL and API_AUTH_KEY are set correctly.'
        );
      }
    },
    onSuccess: (imageUrl) => {
      setGeneratedImage(imageUrl);
      setInsufficientCoins(false);
      // Invalidate coin balance to refresh the UI
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.balance });
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.transactions });
    },
    onError: (error: any) => {
      if (isInsufficientCoinsError(error)) {
        setInsufficientCoins(true);
      }
      console.error('Image generation error:', error);
    },
  });

  return {
    generateImage: mutation.mutate,
    isGenerating: mutation.isPending,
    error: mutation.error?.message,
    generatedImage,
    insufficientCoins,
    resetImage: () => setGeneratedImage(null),
  };
}
