"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/markdown-content";
import type { Message } from "@/hooks/use-assistant";

interface AssistantMessageProps {
  message: Message;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <Card className={`max-w-[80%] ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        <CardContent className="p-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium opacity-70">
              {isUser ? "You" : "Assistant"}
            </span>
            <MarkdownContent content={message.content} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
