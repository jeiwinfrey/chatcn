"use client";

interface MarkdownContentProps {
  content: string;
}

function renderInlineFormatting(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderMarkdown(content: string): { __html: string } {
  const lines = content.replaceAll("\r\n", "\n").split("\n");
  const blocks: string[] = [];
  let codeFence = false;
  let codeBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    blocks.push(`<ul class="ml-5 list-disc space-y-1">${listBuffer.join("")}</ul>`);
    listBuffer = [];
  };

  const flushCode = () => {
    if (codeBuffer.length === 0) return;
    blocks.push(
      `<pre class="overflow-x-auto rounded-md bg-black/5 p-3 text-sm"><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`
    );
    codeBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      if (codeFence) {
        flushCode();
      }
      flushList();
      codeFence = !codeFence;
      continue;
    }

    if (codeFence) {
      codeBuffer.push(rawLine);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      listBuffer.push(`<li>${renderInlineFormatting(escapeHtml(line.replace(/^[-*]\s+/, "")))}</li>`);
      continue;
    }

    flushList();

    if (!line.trim()) {
      continue;
    }

    const escaped = escapeHtml(line);
    if (line.startsWith("# ")) {
      blocks.push(`<h3 class="text-base font-semibold">${renderInlineFormatting(escaped.slice(2))}</h3>`);
    } else {
      blocks.push(`<p class="whitespace-pre-wrap leading-relaxed">${renderInlineFormatting(escaped)}</p>`);
    }
  }

  flushList();
  flushCode();

  return { __html: blocks.join("") };
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={renderMarkdown(content)} />;
}
