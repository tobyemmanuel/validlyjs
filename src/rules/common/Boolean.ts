import { RuleHandler, ValidationContext } from "../../types/interfaces.js";

export const booleanRule: RuleHandler = {
  validate: (value: any) =>
    typeof value === "boolean" ||
    (typeof value === "string" &&
      ["true", "false"].includes(value.toLowerCase())),
  message: (params: string[], ctx: ValidationContext) => {
    const message = ctx.config.messages?.boolean;
    return typeof message === "string"
      ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
      : `${ctx.field} must be a boolean value`;
  },

  additionalRules: {
    accepted: () => ({
      validate: (value: any) => value === true || value === "true",
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.accepted;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : `${ctx.field} must be accepted`;
      },
    }),
  },
};
