"use client";

import { useState, useRef } from "react";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export interface UseChatOptions {
  api?: string;
  initialMessages?: Message[];
  systemPrompt?: string;
  onError?: (error: Error) => void;
}

export interface UseChatReturn {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  error: Error | null;
  sendMessage: () => Promise<void>;
  stop: () => void;
}

/**
 * React hook for managing chat state and streaming responses from an AI API.
 * 
 * Handles message history, input state, loading state, and streaming responses.
 * Supports aborting in-flight requests.
 * 
 * @param options - Configuration options for the chat hook
 * @param options.api - API endpoint for chat requests (default: '/api/chat')
 * @param options.initialMessages - Initial message history (default: [])
 * @param options.systemPrompt - System prompt to prepend to all requests (optional)
 * @param options.onError - Error callback function
 * @returns Object containing chat state and control functions
 * 
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { messages, input, setInput, sendMessage, isLoading } = useChat({
 *     api: '/api/chat',
 *     systemPrompt: 'You are a helpful assistant.',
 *     onError: (error) => console.error('Chat error:', error)
 *   });
 * 
 *   return (
 *     <div>
 *       {messages.map((msg, i) => (
 *         <div key={i}>{msg.role}: {msg.content}</div>
 *       ))}
 *       <input value={input} onChange={(e) => setInput(e.target.value)} />
 *       <button onClick={sendMessage} disabled={isLoading}>Send</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { api = "/api/chat", initialMessages = [], systemPrompt, onError } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      // Prepend system prompt if provided
      const messagesToSend = systemPrompt
        ? [{ role: "system" as const, content: systemPrompt }, ...newMessages]
        : newMessages;

      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToSend }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        const errorResponse = response.clone();
        try {
          const payload = (await errorResponse.json()) as { error?: string };
          if (payload?.error) message = payload.error;
        } catch {
          const text = await errorResponse.text();
          if (text.trim()) message = text;
        }
        throw new Error(message);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;

        setMessages([
          ...newMessages,
          { role: "assistant", content: assistantMessage },
        ]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      if (error.name !== "AbortError") {
        setError(error);
        if (onError) onError(error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    stop,
  };
}
