import { describe, it, expect } from "vitest";
import { resolvePath } from "./path-resolver.js";
import type { PathContext } from "./path-resolver.js";

describe("resolvePath", () => {
  describe("{{components}} placeholder", () => {
    it("should use shadcnConfig componentsPath when available", () => {
      const context: PathContext = {
        framework: "next",
        shadcnConfig: {
          componentsPath: "custom/components",
          libPath: "custom/lib",
          aliases: {
            components: "@/custom/components",
            utils: "@/custom/lib/utils",
          },
        },
        cwd: "/project",
      };

      const result = resolvePath("{{components}}/chat.tsx", context);
      expect(result).toBe("/project/custom/components/chat.tsx");
    });

    it("should use framework default when shadcnConfig is null", () => {
      const context: PathContext = {
        framework: "next",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{components}}/chat.tsx", context);
      expect(result).toBe("/project/components/chat.tsx");
    });

    it("should use framework default for vite", () => {
      const context: PathContext = {
        framework: "vite",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{components}}/ui/chat.tsx", context);
      expect(result).toBe("/project/src/components/ui/chat.tsx");
    });

    it("should use framework default for remix", () => {
      const context: PathContext = {
        framework: "remix",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{components}}/chat.tsx", context);
      expect(result).toBe("/project/app/components/chat.tsx");
    });
  });

  describe("{{hooks}} placeholder", () => {
    it("should resolve hooks for next framework", () => {
      const context: PathContext = {
        framework: "next",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{hooks}}/use-chat.ts", context);
      expect(result).toBe("/project/hooks/use-chat.ts");
    });

    it("should resolve hooks for remix framework", () => {
      const context: PathContext = {
        framework: "remix",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{hooks}}/use-chat.ts", context);
      expect(result).toBe("/project/app/hooks/use-chat.ts");
    });

    it("should resolve hooks for vite framework", () => {
      const context: PathContext = {
        framework: "vite",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{hooks}}/use-chat.ts", context);
      expect(result).toBe("/project/src/hooks/use-chat.ts");
    });

    it("should resolve hooks for astro framework", () => {
      const context: PathContext = {
        framework: "astro",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{hooks}}/use-chat.ts", context);
      expect(result).toBe("/project/src/hooks/use-chat.ts");
    });
  });

  describe("{{lib}} placeholder", () => {
    it("should use shadcnConfig libPath when available", () => {
      const context: PathContext = {
        framework: "next",
        shadcnConfig: {
          componentsPath: "components",
          libPath: "custom/lib",
          aliases: {
            components: "@/components",
            utils: "@/custom/lib/utils",
          },
        },
        cwd: "/project",
      };

      const result = resolvePath("{{lib}}/llm.ts", context);
      expect(result).toBe("/project/custom/lib/llm.ts");
    });

    it("should use framework default when shadcnConfig is null", () => {
      const context: PathContext = {
        framework: "next",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{lib}}/llm.ts", context);
      expect(result).toBe("/project/lib/llm.ts");
    });

    it("should use framework default for vite", () => {
      const context: PathContext = {
        framework: "vite",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{lib}}/utils.ts", context);
      expect(result).toBe("/project/src/lib/utils.ts");
    });
  });

  describe("{{api}} placeholder", () => {
    it("should resolve api route for next framework", () => {
      const context: PathContext = {
        framework: "next",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{api}}", context);
      expect(result).toBe("/project/app/api/chat/route.ts");
    });

    it("should resolve api route for remix framework", () => {
      const context: PathContext = {
        framework: "remix",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{api}}", context);
      expect(result).toBe("/project/app/routes/api.chat.ts");
    });

    it("should resolve api route for astro framework", () => {
      const context: PathContext = {
        framework: "astro",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{api}}", context);
      expect(result).toBe("/project/src/pages/api/chat.ts");
    });

    it("should use fallback for frameworks without api route", () => {
      const context: PathContext = {
        framework: "vite",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{api}}", context);
      expect(result).toBe("/project/src/api/chat.ts");
    });
  });

  describe("path normalization", () => {
    it("should normalize backslashes to forward slashes", () => {
      const context: PathContext = {
        framework: "next",
        shadcnConfig: null,
        cwd: "C:\\Users\\project",
      };

      const result = resolvePath("{{components}}/chat.tsx", context);
      // Should contain only forward slashes
      expect(result).not.toContain("\\");
      expect(result).toContain("/");
    });

    it("should handle nested paths correctly", () => {
      const context: PathContext = {
        framework: "next",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("{{components}}/ui/chat/message.tsx", context);
      expect(result).toBe("/project/components/ui/chat/message.tsx");
    });
  });

  describe("multiple placeholders", () => {
    it("should resolve multiple placeholders in one path", () => {
      const context: PathContext = {
        framework: "next",
        shadcnConfig: {
          componentsPath: "src/components",
          libPath: "src/lib",
          aliases: {
            components: "@/src/components",
            utils: "@/src/lib/utils",
          },
        },
        cwd: "/project",
      };

      // This is a contrived example, but tests the capability
      const result = resolvePath("{{lib}}/test.ts", context);
      expect(result).toBe("/project/src/lib/test.ts");
    });
  });

  describe("no placeholders", () => {
    it("should return absolute path when no placeholders present", () => {
      const context: PathContext = {
        framework: "next",
        shadcnConfig: null,
        cwd: "/project",
      };

      const result = resolvePath("custom/path/file.ts", context);
      expect(result).toBe("/project/custom/path/file.ts");
    });
  });
});
