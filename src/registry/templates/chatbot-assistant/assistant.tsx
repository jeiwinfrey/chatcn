"use client";

import { useEffect, useRef } from "react";
import { useAssistant } from "@/hooks/use-assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AssistantMessage } from "@/components/assistant-message";

const SYSTEM_PROMPT = "__SYSTEM_PROMPT__";
const EMPTY_STATE = "Ask for help, ideas, or a walkthrough.";
const SHOW_LOADING_INDICATOR = __SHOW_LOADING_INDICATOR__;

export function Assistant() {
  const { messages, input, setInput, isLoading, sendMessage, stop, error } = useAssistant({
    systemPrompt: SYSTEM_PROMPT,
  });
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">Ask me anything</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Welcome.</p>
              <p className="mt-1">{EMPTY_STATE}</p>
            </div>
          ) : null}
          {messages.map((message, index) => (
            <AssistantMessage key={index} message={message} />
          ))}
          {SHOW_LOADING_INDICATOR && isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg border bg-muted px-4 py-2">
                <div className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-foreground/20" />
                  <div className="h-4 w-full animate-pulse rounded bg-foreground/20" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-foreground/20" />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <Separator />

      <form onSubmit={handleSubmit} className="p-4">
        {error ? (
          <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}
          </div>
        ) : null}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          {isLoading ? (
            <Button type="button" onClick={stop} variant="outline">
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              Send
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Press Enter to send.
        </p>
      </form>
    </Card>
  );
}
