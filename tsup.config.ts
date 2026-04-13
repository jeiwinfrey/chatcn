import { defineConfig } from "tsup";
import { copyFileSync, cpSync, mkdirSync } from "node:fs";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  banner: {
    js: "#!/usr/bin/env node",
  },
  clean: true,
  shims: true,
  minify: false,
  onSuccess: async () => {
    // Copy registry.json to dist/registry/
    mkdirSync("dist/registry", { recursive: true });
    copyFileSync("src/registry/registry.json", "dist/registry/registry.json");
    
    // Copy template files to dist/registry/templates/
    cpSync("src/registry/templates", "dist/registry/templates", {
      recursive: true,
      filter: (source) => !source.endsWith(".test.ts"),
    });
    
    console.log("✓ Copied registry.json and template files to dist/");
  },
});
