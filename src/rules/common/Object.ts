import { RuleHandler, ValidationContext } from "../../types/interfaces.js";
import { Validator } from "../../core/Validator.js";
import { SchemaDefinition } from "../../types/interfaces.js";

export const objectRule: RuleHandler = {
  validate: (value: any) =>
    typeof value === "object" && !Array.isArray(value) && value !== null,
  message: ([], ctx: ValidationContext) => {
    const message = ctx.config.messages?.object;
    return typeof message === "string"
    ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
    : `${ctx.field} must be an object`;
  },

  additionalRules: {
    shape: (schema: SchemaDefinition) => ({
      validate: async (
        obj: object,
        params: string[],
        ctx: ValidationContext
      ) => {
        const validator = new Validator(schema);
        const result = await validator.validateAsync(obj);
        return result.isValid;
      },
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.shape;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : `${ctx.field} has an invalid structure`;
      },
    }),
    strict: () => ({
      validate: (obj: object, [], ctx: ValidationContext) => {
        if (!ctx.schema) {
          throw new Error("Schema is required for strict validation");
        }
        const extraKeys = Object.keys(obj).filter(
          (key) => !(key in ctx.schema!)
        );
        return extraKeys.length === 0;
      },
      message: ([], ctx: ValidationContext) => {
        const message = ctx.config.messages?.strict;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : `${ctx.field} contains unexpected fields`;
      },
    }),
  },
};
