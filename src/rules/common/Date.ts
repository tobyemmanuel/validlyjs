import { RuleHandler, ValidationContext } from "../../types/interfaces.js";

export const dateRule: RuleHandler = {
  validate: (value: any, params: string[], ctx: ValidationContext) =>
    !isNaN(Date.parse(params[0])),
  message: (params: string[], ctx: ValidationContext) => {
    const message = ctx.config.messages?.date;
    return typeof message === "string"
      ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
      : `${ctx.field} must be a valid date`;
  },

  additionalRules: {
    after: () => ({
      validate: (value: any, params: string[], ctx: ValidationContext) =>
        new Date(value) > new Date(params[0]),
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.after;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : `${ctx.field} must be after ${params[0]}`;
      },
    }),
    before: () => ({
      validate: (value: any, params: string[], ctx: ValidationContext) =>
        new Date(value) < new Date(params[0]),
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.before;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : `${ctx.field} must be before ${params[0]}`;
      },
    }),
    date_equals: () => ({
      validate: (value: any, params: string[], ctx: ValidationContext) =>
        new Date(value).toDateString() === new Date(params[0]).toDateString(),
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.date_equals;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : `${ctx.field} must be equal to ${params[0]}`;
      },
    }),
  },
};
