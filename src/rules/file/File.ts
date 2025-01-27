import { RuleHandler } from "../../types/interfaces.js";

export const fileRule: RuleHandler = {
  validate: (value: any) =>
    value instanceof File ||
    (typeof Blob !== "undefined" && value instanceof Blob),
  message: () => "Must be a file",

  additionalRules: {
    maxSize: () => ({
      // maxSize: (max: string) => ({
      validate: (file: File, params: string[]) => {
        const bytes = parseFileSize(params[0]);
        return file.size <= bytes;
      },
      message: (params) => `File size must be less than ${params[0]}`
    }),
    mimes: () => ({
      // mimes: (types: string) => ({
      validate: (file: File, params: string[]) =>
        params.some(ext => 
          file.type === mimeTypes[ext] || 
          file.name.toLowerCase().endsWith(`.${ext}`)
        ),
      message: (params) => `Allowed file types: ${params.join(', ')}`
    }),
    dimensions: () => ({
      // dimensions: (constraints: string) => ({
      validate: async (file: File, params: string[]) => {
        const [minWidth, minHeight, maxWidth, maxHeight] = params.map(Number);
        const img = await createImageBitmap(file);
        return img.width >= (minWidth || 0) && 
               img.height >= (minHeight || 0) &&
               (!maxWidth || img.width <= maxWidth) &&
               (!maxHeight || img.height <= maxHeight);
      },
      message: () => "Invalid image dimensions"
    })
  }
};

// Helper functions
const mimeTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  // Add more MIME types as needed
};

function parseFileSize(size: string): number {
  const units: Record<string, number> = { 
    KB: 1e3, 
    MB: 1e6, 
    GB: 1e9 
  };
  const match = size.match(/^(\d+)(KB|MB|GB)$/);
  return match ? parseInt(match[1]) * units[match[2]] : 0;
}