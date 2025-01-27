import { RuleHandler, ValidationContext } from "../../types/interfaces.js";

export const numberRule: RuleHandler = {
  validate: (value: any) => {
    // validate: (value: any, params: string[], ctx: ValidationContext) => {
    if (typeof value === "string") {
      return !isNaN(Number(value)) && isFinite(Number(value));
    }
    return typeof value === "number" && isFinite(value);
  },
  message: ([], ctx: ValidationContext) => {
    // message: (params: string[], ctx: ValidationContext) => {
    const message = ctx.config.messages?.number;
    return typeof message === "string"
      ? message.replace(/:attribute/g, ctx.field || "field")
      : `${ctx.field} must be a number`;
  },

  additionalRules: {
    min: (min: number) => ({
      validate: (value: any) =>
        // validate: (value: any, params: string[], ctx: ValidationContext) =>
        Number(value) >= min,
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.min;
        if (typeof message === "object" && message.numeric) {
          return message.numeric
            .replace(/:attribute/g, ctx.field || "field")
            .replace(/:min/g, min.toString());
        }
        return `${ctx.field} must be at least ${min}`;
      }
    }),
    max: (max: number) => ({
      validate: (value: any) =>
        // validate: (value: any, params: string[], ctx: ValidationContext) =>
        Number(value) <= max,
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.max;
        if (typeof message === "object" && message.numeric) {
          return message.numeric
            .replace(/:attribute/g, ctx.field || "field")
            .replace(/:max/g, max.toString());
        }
        return `${ctx.field} may not be greater than ${max}`;
      }
    }),
    integer: () => ({
      validate: (value: any) =>
        // validate: (value: any, params: string[], ctx: ValidationContext) =>
        Number.isInteger(Number(value)),
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.integer;
        return typeof message === "string"
          ? message.replace(/:attribute/g, ctx.field || "field")
          : `${ctx.field} must be an integer`;
      }
    }),
    digits: (length: number) => ({
      validate: (value: any) =>
        // validate: (value: any, params: string[], ctx: ValidationContext) =>
        Number(value).toString().length === length,
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.digits;
        return typeof message === "string"
          ? message
              .replace(/:attribute/g, ctx.field || "field")
              .replace(/:length/g, length.toString())
          : `${ctx.field} must have exactly ${length} digits`;
      }
    }),
    digits_between: (min: number, max: number) => ({
      validate: (value: any) => {
        // validate: (value: any, params: string[], ctx: ValidationContext) => {
        const len = Number(value).toString().length;
        return len >= min && len <= max;
      },
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.digits_between;
        return typeof message === "string"
          ? message
              .replace(/:attribute/g, ctx.field || "field")
              .replace(/:min/g, min.toString())
              .replace(/:max/g, max.toString())
          : `${ctx.field} must have between ${min} and ${max} digits`;
      }
    }),
    multiple_of: (factor: number) => ({
      validate: (value: any) =>
        // validate: (value: any, params: string[], ctx: ValidationContext) =>
        Number(value) % factor === 0,
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.multiple_of;
        return typeof message === "string"
          ? message
              .replace(/:attribute/g, ctx.field || "field")
              .replace(/:factor/g, factor.toString())
          : `${ctx.field} must be a multiple of ${factor}`;
      }
    })
  }
};