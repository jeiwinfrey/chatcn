"use client";

import { useState, useRef } from "react";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export interface UseAssistantOptions {
  api?: string;
  initialMessages?: Message[];
  systemPrompt?: string;
  onError?: (error: Error) => void;
}

export interface UseAssistantReturn {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  error: Error | null;
  sendMessage: () => Promise<void>;
  stop: () => void;
}

/**
 * React hook for managing assistant chat state and streaming responses from an AI API.
 * 
 * Handles message history, input state, loading state, and streaming responses.
 * Supports aborting in-flight requests. Designed for assistant-style chatbot interfaces.
 * 
 * @param options - Configuration options for the assistant hook
 * @param options.api - API endpoint for chat requests (default: '/api/chat')
 * @param options.initialMessages - Initial message history (default: [])
 * @param options.onError - Error callback function
 * @returns Object containing chat state and control functions
 * 
 * @example
 * ```tsx
 * function AssistantComponent() {
 *   const { messages, input, setInput, sendMessage, isLoading } = useAssistant({
 *     api: '/api/chat',
 *     onError: (error) => console.error('Assistant error:', error)
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
export function useAssistant(options: UseAssistantOptions = {}): UseAssistantReturn {
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
        try {
          const errorBody = await response.clone().text();
          if (errorBody.trim()) {
            const payload = JSON.parse(errorBody) as { error?: string };
            message = payload?.error?.trim() || errorBody;
          }
        } catch {
          const text = await response.clone().text();
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
