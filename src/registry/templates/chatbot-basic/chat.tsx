"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownContent } from "@/components/markdown-content";

const SYSTEM_PROMPT = "__SYSTEM_PROMPT__";
const EMPTY_STATE = "Ask me anything to get started.";
const SHOW_USER_AVATAR = __SHOW_USER_AVATAR__;
const SHOW_ASSISTANT_AVATAR = __SHOW_ASSISTANT_AVATAR__;
const SHOW_USER_NAME = __SHOW_USER_NAME__;
const SHOW_ASSISTANT_NAME = __SHOW_ASSISTANT_NAME__;
const SHOW_LOADING_INDICATOR = __SHOW_LOADING_INDICATOR__;

export function Chat() {
  const { messages, input, setInput, isLoading, sendMessage, stop, error } = useChat({
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
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-lg">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Welcome.</p>
              <p className="mt-1">{EMPTY_STATE}</p>
            </div>
          ) : null}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`flex max-w-[80%] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {(message.role === "user" ? SHOW_USER_AVATAR : SHOW_ASSISTANT_AVATAR) ? (
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "user" ? "U" : "AI"}
                  </div>
                ) : null}
                <div className="flex min-w-0 flex-col gap-1">
                  {(message.role === "user" ? SHOW_USER_NAME : SHOW_ASSISTANT_NAME) ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      {message.role === "user" ? "You" : "Assistant"}
                    </span>
                  ) : null}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <MarkdownContent content={message.content} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {SHOW_LOADING_INDICATOR && isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="rounded-lg border bg-muted px-4 py-2 text-sm text-muted-foreground">
                Assistant is typing...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
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
    </div>
  );
}
