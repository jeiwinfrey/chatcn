"use client";

import { Card, CardContent } from "@/components/ui/card";
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
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
