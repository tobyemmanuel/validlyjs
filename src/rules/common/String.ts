import {
  RuleHandler,
  ValidationContext,
  DefaultMessages,
} from "../../types/interfaces.js";

export const stringRule: RuleHandler = {
  validate: (value: any) => typeof value === "string",
  message: ([], ctx: ValidationContext) => {
    const message = ctx.config.messages?.string;
    return typeof message === "string"
      ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
      : `${ctx.field} must be a string`;
  },
  additionalRules: {
    min: () => ({
      validate: (value: string, params: string[]) => {
        return value.length >= Number(params[0]);
      },
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.min;
        return typeof message === "string"
          ? ctx.formatMessage(
              { attribute: ctx.field || "field", min: params[0] },
              message
            )
          : `${ctx.field} must be at least ${params[0]} characters`;
      },
    }),
    max: () => ({
      validate: (value: string, params: string[]) =>
        value.length <= Number(params[0]),
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.max;
        return typeof message === "string"
          ? ctx.formatMessage(
              { attribute: ctx.field || "field", max: params[0] },
              message
            )
          : `${ctx.field} may not be greater than ${params[0]} characters`;
      },
    }),
    email: () => ({
      validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: ([], ctx: ValidationContext) => {
        const message = ctx.config.messages?.email;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : `${ctx.field} must be a valid email address`;
      },
    }),
    alpha: () => ({
      validate: (value: string) => /^[A-Za-z]+$/.test(value),
      message: ([], ctx: ValidationContext) => {
        const message = ctx.config.messages?.alpha;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : `${ctx.field} must contain only letters`;
      },
    }),
    alpha_num: () => ({
      validate: (value: string) => /^[A-Za-z0-9]+$/.test(value),
      message: ([], ctx: ValidationContext) => {
        const message = ctx.config.messages.alpha_num;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : `${ctx.field} must contain only letters and numbers`;
      },
    }),
    uuid: () => ({
      validate: (value: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          value
        ),
      message: ([], ctx: ValidationContext) => {
        const message = ctx.config.messages.uuid;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : `${ctx.field} must be a valid UUID`;
      },
    }),
  },
};
