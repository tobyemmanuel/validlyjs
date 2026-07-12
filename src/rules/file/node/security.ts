import path from 'path';

let fileBaseDir: string | null = null;

/**
 * Restrict filesystem rules (file.exists / file.permissions / file.path) to a base directory.
 * When set, any path that escapes this directory is rejected (path traversal protection).
 */
export function setFileBaseDir(dir: string): void {
  fileBaseDir = path.resolve(dir);
}

export function getFileBaseDir(): string | null {
  return fileBaseDir;
}

/**
 * Resolve `value` to an absolute path confined to the configured base directory.
 * Returns `null` when the path is invalid or escapes the base directory.
 */
export function resolveWithinBaseDir(value: any): string | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  const resolved = path.resolve(value);
  if (fileBaseDir) {
    const relative = path.relative(fileBaseDir, resolved);
    if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
      return null;
    }
  }
  return resolved;
}