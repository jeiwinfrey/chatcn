"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/markdown-content";
import type { Message } from "@/hooks/use-assistant";

const SHOW_USER_AVATAR = __SHOW_USER_AVATAR__;
const SHOW_ASSISTANT_AVATAR = __SHOW_ASSISTANT_AVATAR__;
const SHOW_USER_NAME = __SHOW_USER_NAME__;
const SHOW_ASSISTANT_NAME = __SHOW_ASSISTANT_NAME__;

interface AssistantMessageProps {
  message: Message;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {(isUser ? SHOW_USER_AVATAR : SHOW_ASSISTANT_AVATAR) ? (
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
              {isUser ? "U" : "AI"}
            </AvatarFallback>
          </Avatar>
        ) : null}
        <div className="flex min-w-0 flex-col gap-1">
          {(isUser ? SHOW_USER_NAME : SHOW_ASSISTANT_NAME) ? (
            <span className="text-xs font-medium text-muted-foreground">
              {isUser ? "You" : "Assistant"}
            </span>
          ) : null}
          <Card className={`max-w-[80%] ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            <CardContent className="p-3">
              <MarkdownContent content={message.content} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
