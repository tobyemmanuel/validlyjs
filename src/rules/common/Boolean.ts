import { RuleHandler, ValidationContext } from "../../types/interfaces.js";

export const booleanRule: RuleHandler = {
  validate: (value: any) =>
    typeof value === "boolean" ||
    (typeof value === "string" &&
      ["true", "false"].includes(value.toLowerCase())),
  message: ([], ctx: ValidationContext) => {
    // message: (params: string[], ctx: ValidationContext) => {
    const message = ctx.config.messages?.boolean;
    return typeof message === "string"
      ? message.replace(/:attribute/g, ctx.field || "field")
      : `${ctx.field} must be a boolean value`;
  },

  additionalRules: {
    accepted: () => ({
      validate: (value: any) => value === true || value === "true",
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.accepted;
        return typeof message === "string"
          ? message.replace(/:attribute/g, ctx.field || "field")
          : `${ctx.field} must be accepted`;
      },
    }),
  },
};
