import { RuleHandler, ValidationContext } from "../../types/interfaces.js";

export const requiredRule: RuleHandler = {
  validate: (value: any) => {
    if (value === undefined || value === null) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
  },
  message: (params: string[], ctx: ValidationContext) => {
    const message = ctx.config.messages?.required;
    return typeof message === "string"
      ? ctx.formatMessage({ attribute: ctx.field || 'field' }, message)
      : `${ctx.field || 'field'} is required`;
  },
};

export const nullableRule: RuleHandler = {
  validate: (value: any) => value === null || value === undefined,
  message: ([], ctx: ValidationContext) => {
    const message = ctx.config.messages?.nullable;
    return typeof message === "string"
      ? message.replace(/:attribute/g, ctx.field || "field")
      : `${ctx.field} can be null or undefined`;
  },
};