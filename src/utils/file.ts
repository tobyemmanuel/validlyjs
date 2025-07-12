/**
 * Parses a size string (e.g., "2MB", "500KB", "1024") into bytes.
 * @param size - Size as a number (bytes) or string (e.g., "2MB", "500KB")
 * @returns Number of bytes
 * @throws Error if the size format is invalid
 */
export function parseSize(size: number | string): number {
  if (typeof size === 'number') {
    if (isNaN(size) || size < 0) {
      throw new Error('Invalid size: must be a non-negative number');
    }
    return size;
  }

  if (typeof size !== 'string') {
    throw new Error('Invalid size: must be a number or string');
  }

  const regex = /^(\d*\.?\d+)\s*(B|KB|MB|GB|TB)$/i;
  const match = size.match(regex);

  if (!match) {
    throw new Error(`Invalid size format: ${size}`);
  }

  const value = parseFloat(match[1] as string);
  const unit = (match[2] as string).toUpperCase();

  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };

  if (isNaN(value) || value < 0) {
    throw new Error('Invalid size: value must be a non-negative number');
  }

  if (!units[unit]) throw new Error(`Invalid size unit: ${unit}`);

  return value * (units[(unit as string)] as number);
}
