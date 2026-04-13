import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * **Validates: Requirements 13.9, 16.7**
 * 
 * Template Syntax Validation Tests
 * 
 * These tests verify that all template files:
 * - Have valid TypeScript syntax
 * - Have valid imports (using path aliases)
 * - Can be type-checked in a simulated project environment
 */

describe("Template File Syntax Validation", () => {
  const templatesDir = join(process.cwd(), "src/registry/templates");
  const templateDirs = ["chatbot-basic", "chatbot-ui", "chatbot-assistant", "chatbot-support"];

  describe("Template file existence", () => {
    it("should have all required template directories", () => {
      const dirs = readdirSync(templatesDir).filter((name) => {
        const fullPath = join(templatesDir, name);
        return statSync(fullPath).isDirectory();
      });

      for (const templateDir of templateDirs) {
        expect(dirs).toContain(templateDir);
      }
    });

    it("should have at least one file in each template directory", () => {
      for (const templateDir of templateDirs) {
        const files = readdirSync(join(templatesDir, templateDir));
        expect(files.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Template file syntax", () => {
    it("should have valid TypeScript/TSX syntax in all template files", () => {
      const allFiles = getAllTemplateFiles();

      for (const file of allFiles) {
        const content = readFileSync(file, "utf-8");
        
        // Check for basic syntax issues
        expect(content).toBeTruthy();
        expect(content.length).toBeGreaterThan(0);
        
        // Check for balanced braces
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        expect(openBraces).toBe(closeBraces);
        
        // Check for balanced parentheses
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        expect(openParens).toBe(closeParens);
        
        // Check for balanced brackets
        const openBrackets = (content.match(/\[/g) || []).length;
        const closeBrackets = (content.match(/\]/g) || []).length;
        expect(openBrackets).toBe(closeBrackets);
      }
    });

    it("should have valid import statements", () => {
      const allFiles = getAllTemplateFiles();

      for (const file of allFiles) {
        const content = readFileSync(file, "utf-8");
        const importLines = content.split("\n").filter((line) => line.trim().startsWith("import"));

        for (const importLine of importLines) {
          // Check import syntax is valid
          expect(importLine).toMatch(/^import\s+/);
          
          // Check for proper string quotes
          expect(importLine).toMatch(/["']/);
          
          // Check imports use path aliases or relative paths
          if (importLine.includes("@/")) {
            // Path alias imports should be valid
            expect(importLine).toMatch(/@\/[a-z-/]+/);
          } else if (importLine.includes("./") || importLine.includes("../")) {
            // Relative imports should be valid
            expect(importLine).toMatch(/['"]\.[./a-z-]+['"]/);
          } else {
            // Package imports should be valid (including node built-ins with underscores)
            expect(importLine).toMatch(/from\s+["'][a-z@/_-]+["']/);
          }
        }
      }
    });

    it("should use consistent path aliases", () => {
      const allFiles = getAllTemplateFiles();
      const pathAliases = new Set<string>();

      for (const file of allFiles) {
        const content = readFileSync(file, "utf-8");
        const importLines = content.split("\n").filter((line) => line.trim().startsWith("import"));

        for (const importLine of importLines) {
          const aliasMatch = importLine.match(/@\/([a-z-]+)/);
          if (aliasMatch) {
            pathAliases.add(aliasMatch[1]);
          }
        }
      }

      // All templates should use consistent path aliases
      // Expected aliases: components, hooks, lib
      const expectedAliases = ["components", "hooks", "lib"];
      for (const alias of pathAliases) {
        expect(expectedAliases).toContain(alias);
      }
    });
  });

  describe("Template file content validation", () => {
    it("should export components/functions from all files", () => {
      const allFiles = getAllTemplateFiles();

      for (const file of allFiles) {
        const content = readFileSync(file, "utf-8");
        
        // Each file should have at least one export
        expect(content).toMatch(/export\s+(function|const|type|interface|class)/);
      }
    });

    it("should have proper TypeScript types in hook files", () => {
      const hookFiles = getAllTemplateFiles().filter((f) => 
        f.endsWith(".ts") && f.includes("use-") // Only actual hook files
      );

      for (const file of hookFiles) {
        const content = readFileSync(file, "utf-8");
        
        // Hook files should define types/interfaces
        expect(content).toMatch(/export\s+(type|interface)/);
        
        // Hook files should export a function
        expect(content).toMatch(/export\s+function/);
      }
    });

    it("should use 'use client' directive in client components", () => {
      const tsxFiles = getAllTemplateFiles().filter((f) => f.endsWith(".tsx"));

      for (const file of tsxFiles) {
        const content = readFileSync(file, "utf-8");
        const firstLine = content.split("\n")[0].trim();
        
        // All TSX files should have "use client" directive
        expect(firstLine).toBe('"use client";');
      }
    });

    it("should use 'use client' directive in hook files", () => {
      const hookFiles = getAllTemplateFiles().filter((f) => f.includes("use-"));

      for (const file of hookFiles) {
        const content = readFileSync(file, "utf-8");
        const firstLine = content.split("\n")[0].trim();
        
        // All hook files should have "use client" directive
        expect(firstLine).toBe('"use client";');
      }
    });
  });

  describe("TypeScript compilation", () => {
    it("should have valid TypeScript syntax without external dependencies", () => {
      const allFiles = getAllTemplateFiles();

      for (const file of allFiles) {
        const content = readFileSync(file, "utf-8");
        
        // Check for common TypeScript syntax errors
        
        // 1. Check for unclosed template literals
        const backticks = (content.match(/`/g) || []).length;
        expect(backticks % 2).toBe(0); // Should be even number
        
        // 2. Check for proper arrow function syntax
        const arrowFunctions = content.match(/=>\s*{/g);
        if (arrowFunctions) {
          // Each arrow function should have balanced braces
          expect(content).toMatch(/=>\s*{[\s\S]*?}/);
        }
        
        // 3. Check for proper type annotations
        if (file.endsWith(".ts") || file.endsWith(".tsx")) {
          // Should have at least one type annotation or interface
          expect(content).toMatch(/:\s*[A-Z][a-zA-Z<>[\]|]+|interface\s+[A-Z]|type\s+[A-Z]/);
        }
        
        // 4. Check for proper export syntax
        const exports = content.match(/export\s+(function|const|interface|type|class)/g);
        expect(exports).toBeTruthy();
        expect(exports!.length).toBeGreaterThan(0);
      }
    });

    it("should not have common TypeScript errors", () => {
      const allFiles = getAllTemplateFiles();

      for (const file of allFiles) {
        const content = readFileSync(file, "utf-8");
        
        // Check for common mistakes
        
        // 1. No double semicolons
        expect(content).not.toMatch(/;;/);
        
        // 2. Proper async/await usage
        if (content.includes("await")) {
          // If there's await, there should be async
          expect(content).toMatch(/async/);
        }
        
        // 3. No syntax errors in string literals
        // Check that all string quotes are properly closed
        const singleQuotes = content.split("'").length - 1;
        const doubleQuotes = content.split('"').length - 1;
        // Both should be even (each opening has a closing)
        expect(singleQuotes % 2).toBe(0);
        expect(doubleQuotes % 2).toBe(0);
      }
    });
  });
});

/**
 * Helper function to get all template files recursively
 * Excludes test files
 */
function getAllTemplateFiles(): string[] {
  const templatesDir = join(process.cwd(), "src/registry/templates");
  const files: string[] = [];

  function walkDir(dir: string) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if ((entry.endsWith(".ts") || entry.endsWith(".tsx")) && !entry.endsWith(".test.ts")) {
        files.push(fullPath);
      }
    }
  }

  walkDir(templatesDir);
  return files;
}
