import { RuleHandler, ValidationContext } from "../../types/interfaces.js";
import { Validator } from "../../core/Validator.js";
import { RuleDefinition } from "../../types/interfaces.js";

export const arrayRule: RuleHandler = {
  validate: (value: any) => Array.isArray(value),
  message: (params: string[], ctx: ValidationContext) => {
    const message = ctx.config.messages?.array;
    return typeof message === "string"
      ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
      : ctx.formatMessage({ attribute: ctx.field || "field" }, "Must be an array");
  },

  additionalRules: {
    each: (rule: RuleDefinition) => ({
      validate: async (arr, params: string[], ctx: ValidationContext) => {
        const validator = new Validator({ "*": rule }, { schema: ctx.schema });
        for (const [index, item] of arr.entries()) {
          const result = await validator.validateAsync({ [index]: item });
          if (!result.isValid) return false;
        }
        return true;
      },
      message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.each;
        return typeof message === "string"
          ? ctx.formatMessage({ attribute: ctx.field || "field" }, message)
          : ctx.formatMessage({ attribute: ctx.field || "field" }, "All items must be valid");
      },
    }),
    min: () => ({
      validate: (arr: any[], params: string[]) =>
        arr.length >= Number(params[0]),
      message: (params: string[], ctx: ValidationContext) => {
        return ctx.formatMessage({ attribute: ctx.field || "field", min: params[0] }, "Must have at least :min items");
      },
    }),
    max: () => ({
      validate: (arr: any[], params: string[]) =>
        arr.length <= Number(params[0]),
      message: (params: string[], ctx: ValidationContext) => {
        return ctx.formatMessage({ attribute: ctx.field || "field", max: params[0] }, "Cannot have more than :max items");
      },
    }),
    distinct: () => ({
      validate: (arr: any[], params: string[]) => {
        const seen = new Set();
        return arr.every((item) => {
          const value = params[0] ? item[params[0]] : item;
          return seen.has(value) ? false : (seen.add(value), true);
        });
      },
      message: (params: string[], ctx: ValidationContext) => {
        return params[0]
          ? ctx.formatMessage({ attribute: ctx.field || "field", key: params[0] }, "All :key values must be unique")
          : ctx.formatMessage({ attribute: ctx.field || "field" }, "Duplicate items found");
      },
    }),
    size: () => ({
      validate: (arr: any[], params: string[]) =>
        arr.length === Number(params[0]),
      message: (params: string[], ctx: ValidationContext) => {
        return ctx.formatMessage({ attribute: ctx.field || "field", size: params[0] }, "Must contain exactly :size items");
      },
    }),
  },
};