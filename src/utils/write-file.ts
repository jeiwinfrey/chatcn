import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { logger } from "./logger.js";

export function writeFile(
  absolutePath: string,
  content: string,
  overwrite = false
): boolean {
  if (existsSync(absolutePath) && !overwrite) {
    logger.warn(`skipped (already exists): ${absolutePath}`);
    return false;
  }
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
  logger.success(`wrote: ${absolutePath}`);
  return true;
}
