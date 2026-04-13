import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { logger } from "./logger.js";

/**
 * Writes content to a file with overwrite protection.
 * Creates parent directories if they don't exist.
 * 
 * @param absolutePath - The absolute path where the file should be written
 * @param content - The content to write to the file
 * @param overwrite - Whether to overwrite the file if it already exists (default: false)
 * @returns true if the file was written, false if it was skipped
 * 
 * @example
 * ```ts
 * const written = writeFile('/path/to/file.ts', 'export const foo = "bar";', false);
 * if (written) {
 *   console.log('File written successfully');
 * } else {
 *   console.log('File already exists, skipped');
 * }
 * ```
 */
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
