import { RuleHandler, ValidationContext } from "../../types/interfaces.js";
import { mimeTypes, parseFileSize } from "../../utils/file.js";

export const fileRule: RuleHandler = {
  validate: (value: any) =>
    value instanceof File ||
    (typeof Blob !== "undefined" && value instanceof Blob),
  message: (params: string[], ctx: ValidationContext) => {
    const message = ctx.config.messages?.file;
    return typeof message === "string"
      ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
      : ctx.formatMessage({ attribute: ctx.field || "field" }, "Must be a file");
  },

  additionalRules: {
    maxSize: () => ({
      validate: (file: File, params: string[]) => {
        const bytes = parseFileSize(params[0]);
        return file.size <= bytes;
      },
      message: (params: string[], ctx: ValidationContext) => {
        return ctx.formatMessage({ attribute: ctx.field || "field", size: params[0] }, "File size must be less than :size");
      },
    }),
    mimes: () => ({
      validate: (file: File, params: string[]) =>
        params.some(ext => 
          file.type === mimeTypes[ext] || 
          file.name.toLowerCase().endsWith(`.${ext}`)
        ),
      message: (params: string[], ctx: ValidationContext) => {
        return ctx.formatMessage({ attribute: ctx.field || "field", types: params.join(', ') }, "Allowed file types: :types");
      },
    }),
    dimensions: () => ({
      validate: async (file: File, params: string[]) => {
        const [minWidth, minHeight, maxWidth, maxHeight] = params.map(Number);
        const img = await createImageBitmap(file);
        return img.width >= (minWidth || 0) && 
               img.height >= (minHeight || 0) &&
               (!maxWidth || img.width <= maxWidth) &&
               (!maxHeight || img.height <= maxHeight);
      },
      message: (params: string[], ctx: ValidationContext) => {
        return ctx.formatMessage({ attribute: ctx.field || "field" }, "Invalid image dimensions");
      },
    }),
  },
};
