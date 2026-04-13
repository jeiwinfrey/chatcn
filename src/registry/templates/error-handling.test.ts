import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const HOOK_TEMPLATES = [
  "chatbot-basic/use-chat.ts",
  "chatbot-ui/use-chat.ts",
  "chatbot-assistant/use-assistant.ts",
  "chatbot-support/use-support-chat.ts",
];

describe("template error handling", () => {
  it("reads non-OK response bodies without consuming the same stream twice", () => {
    for (const templatePath of HOOK_TEMPLATES) {
      const content = readFileSync(
        join(process.cwd(), "src/registry/templates", templatePath),
        "utf8"
      );

      expect(content).toContain("const errorBody = await response.clone().text();");
      expect(content).not.toContain("const errorResponse = response.clone();");
      expect(content).not.toContain("await errorResponse.json()");
      expect(content).not.toContain("await errorResponse.text()");
    }
  });
});
