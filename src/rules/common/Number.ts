import { RuleHandler, ValidationContext } from "../../types/interfaces.js";

export const numberRule: RuleHandler = {
  validate: (value: any) => {
    if (typeof value === "string") {
      return !isNaN(Number(value)) && isFinite(Number(value));
    }
    return typeof value === "number" && isFinite(value);
  },
  message: ([], ctx: ValidationContext) => {
    const message = ctx.config.messages?.number;
    return typeof message === "string"
      ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
      : `${ctx.field} must be a number`;
  },
  additionalRules: {
    min: (min: number) => ({
      validate: (value: any, params: string[]) =>
        Number(value) >= Number(params[0]),
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.min;
        return typeof message === "object" && message.numeric
          ? ctx.formatMessage(
              { attribute: ctx.field || "field", min: params[0] },
              message.numeric
            )
          : `${ctx.field} must be at least ${params[0]}`;
      },
    }),
    max: (max: number) => ({
      validate: (value: any, params: string[]) =>
        Number(value) <= Number(params[0]),
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.max;
        return typeof message === "object" && message.numeric
          ? ctx.formatMessage(
              { attribute: ctx.field || "field", max: params[0] },
              message.numeric
            )
          : `${ctx.field} may not be greater than ${params[0]}`;
      },
    }),
    integer: () => ({
      validate: (value: any) => Number.isInteger(Number(value)),
      message: ([], ctx: ValidationContext) => {
        const message = ctx.config.messages?.integer;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : `${ctx.field} must be an integer`;
      },
    }),
    digits: (length: number) => ({
      validate: (value: any, params: string[]) =>
        Number(value).toString().length === Number(params[0]),
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.digits;
        return typeof message === "string"
          ? ctx.formatMessage(
              { attribute: ctx.field || "field", length: params[0].toString() },
              message
            )
          : `${ctx.field} must have exactly ${String(params[0])} digits`;
      },
    }),
    digits_between: (min: number, max: number) => ({
      validate: (value: any, params: string[]) => {
        const len = Number(value).toString().length;
        return len >= Number(params[0]) && len <= Number(params[1]);
      },
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.digits_between;
        return typeof message === "string"
          ? ctx.formatMessage(
              {
                attribute: ctx.field || "field",
                min: params[0].toString(),
                max: params[1].toString(),
              },
              message
            )
          : `${ctx.field} must have between ${params[0]} and ${params[1]} digits`;
      },
    }),
    multiple_of: (factor: number) => ({
      validate: (value: any, params: string[]) =>
        Number(value) % Number(params[0]) === 0,
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.multiple_of;
        return typeof message === "string"
          ? ctx.formatMessage(
              { attribute: ctx.field || "field", factor: params[0] },
              message
            )
          : `${ctx.field} must be a multiple of ${params[0]}`;
      },
    }),
  },
};
