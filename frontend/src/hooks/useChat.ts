import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Message, ChatRole } from '../backend';
import {
  isValidImageType,
  isValidImageSize,
  getImageDimensions,
} from '../utils/imageAttachment';
import { isInsufficientCoinsError, getCoinErrorMessage } from '../utils/coinErrors';
import { coinQueryKeys } from './coinQueryKeys';

export const GROQ_API_KEY_STORAGE_KEY = 'groq_api_key';

export interface AttachmentData {
  file: File;
  bytes: Uint8Array;
  width: number;
  height: number;
}

// Internal representation for Groq API conversation history
interface GroqTextContent {
  type: 'text';
  text: string;
}

interface GroqImageContent {
  type: 'image_url';
  image_url: { url: string };
}

type GroqMessageContent = string | Array<GroqTextContent | GroqImageContent>;

interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: GroqMessageContent;
}

const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Resolves the Groq API key:
 * 1. First checks localStorage (user-entered key)
 * 2. Falls back to environment variable
 * Returns trimmed key or empty string if none found.
 */
export function resolveGroqApiKey(): string {
  const localKey = localStorage.getItem(GROQ_API_KEY_STORAGE_KEY);
  if (localKey && localKey.trim()) {
    return localKey.trim();
  }
  const envKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }
  return '';
}

async function callGroqAPI(conversationHistory: GroqMessage[], apiKey: string): Promise<string> {
  const systemMessage: GroqMessage = {
    role: 'system',
    content:
      'You are a helpful, friendly, and knowledgeable AI assistant. You can understand and respond in multiple languages including Hindi, Urdu, English, and many others. Be concise, accurate, and helpful in your responses.',
  };

  let response: Response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [systemMessage, ...conversationHistory],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
  } catch {
    throw new Error('Network error. Please check your internet connection and try again.');
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API Key. Please check your Groq API key and try again.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    const errorData = await response.json().catch(() => ({}));
    const errorMsg =
      (errorData as { error?: { message?: string } })?.error?.message ||
      `API error: ${response.status} ${response.statusText}`;
    throw new Error(errorMsg);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No response received from AI. Please try again.');
  }

  return content;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function useChat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  // Keep a parallel Groq-formatted history for multi-turn context
  const [groqHistory, setGroqHistory] = useState<GroqMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [insufficientCoins, setInsufficientCoins] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const sendMessage = async (
    prompt: string,
    attachment?: AttachmentData
  ): Promise<void> => {
    setValidationError(null);
    setInsufficientCoins(false);
    setApiKeyMissing(false);

    if (!prompt.trim() && !attachment) {
      setValidationError('Please enter a message or attach an image');
      return;
    }

    if (attachment) {
      if (!isValidImageType(attachment.file)) {
        setValidationError('Only image files are supported');
        return;
      }
      if (!isValidImageSize(attachment.file, 1)) {
        setValidationError('Image size must be less than 1 MB');
        return;
      }
    }

    // Resolve API key at call time (so it picks up freshly saved keys)
    const apiKey = resolveGroqApiKey();
    if (!apiKey) {
      setApiKeyMissing(true);
      setValidationError('Please enter your Groq API key to use the chat.');
      return;
    }

    // Build the user Message for local display
    const userMessage: Message = {
      role: ChatRole.user,
      content: prompt.trim() || '(Image attached)',
      imageBytes: attachment ? attachment.bytes : undefined,
      width: attachment ? BigInt(attachment.width) : undefined,
      height: attachment ? BigInt(attachment.height) : undefined,
      timestamp: BigInt(Date.now()),
    };

    setMessages((prev) => [...prev, userMessage]);

    if (!actor) {
      const errorMessage: Message = {
        role: ChatRole.assistant,
        content: 'Please wait while the connection is being established...',
        timestamp: BigInt(Date.now()),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Deduct coins via backend (20 coins per message)
      await actor.chargeFeatureUsage('processChatMessage');

      // Invalidate coin balance and transaction history after deduction
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.balance });
      queryClient.invalidateQueries({ queryKey: coinQueryKeys.transactions });

      // 2. Build Groq message content (with optional image)
      let groqUserContent: GroqMessageContent;

      if (attachment) {
        const base64 = uint8ArrayToBase64(attachment.bytes);
        const mimeType = attachment.file.type || 'image/jpeg';
        const contentParts: Array<GroqTextContent | GroqImageContent> = [];

        if (prompt.trim()) {
          contentParts.push({ type: 'text', text: prompt.trim() });
        }

        contentParts.push({
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${base64}` },
        });

        groqUserContent = contentParts;
      } else {
        groqUserContent = prompt.trim();
      }

      const newGroqUserMessage: GroqMessage = {
        role: 'user',
        content: groqUserContent,
      };

      const updatedHistory = [...groqHistory, newGroqUserMessage];

      // 3. Call Groq API with full conversation history
      const aiResponseText = await callGroqAPI(updatedHistory, apiKey);

      // 4. Build assistant message for display
      const assistantMessage: Message = {
        role: ChatRole.assistant,
        content: aiResponseText,
        timestamp: BigInt(Date.now()),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // 5. Update Groq history with both user and assistant turns
      const newGroqAssistantMessage: GroqMessage = {
        role: 'assistant',
        content: aiResponseText,
      };
      setGroqHistory([...updatedHistory, newGroqAssistantMessage]);
    } catch (error) {
      if (isInsufficientCoinsError(error)) {
        setInsufficientCoins(true);
        setValidationError(getCoinErrorMessage(error));
        // Remove the optimistically added user message
        setMessages((prev) => prev.slice(0, -1));
      } else {
        const errorText =
          error instanceof Error
            ? error.message
            : 'Sorry, I encountered an error processing your request. Please try again.';

        // Check if it's an API key error so we can surface the key input
        if (
          error instanceof Error &&
          (error.message.includes('Invalid API Key') || error.message.includes('401'))
        ) {
          setApiKeyMissing(true);
          setValidationError(error.message);
          // Remove the optimistically added user message
          setMessages((prev) => prev.slice(0, -1));
        } else {
          const errorMessage: Message = {
            role: ChatRole.assistant,
            content: `⚠️ ${errorText}`,
            timestamp: BigInt(Date.now()),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    validationError,
    insufficientCoins,
    apiKeyMissing,
    clearValidationError: () => {
      setValidationError(null);
      setApiKeyMissing(false);
    },
  };
}
