export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
  });
}

export const mimeTypes: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
};

export function parseFileSize(size: string): number {
  const units: Record<string, number> = {
    KB: 1e3,
    MB: 1e6,
    GB: 1e9,
  };
  const match = size.match(/^(\d+)(KB|MB|GB)$/);
  return match ? parseInt(match[1]) * units[match[2]] : 0;
}
