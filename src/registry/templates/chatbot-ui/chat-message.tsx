"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/markdown-content";
import type { Message } from "@/hooks/use-chat";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
            {isUser ? "U" : "AI"}
          </AvatarFallback>
        </Avatar>
        <Card className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
          <CardContent className="p-3">
            <MarkdownContent content={message.content} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
