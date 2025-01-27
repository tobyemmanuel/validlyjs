import { RuleHandler } from "../../types/interfaces.js";
import { Validator } from "../../core/Validator.js";
import { RuleDefinition } from "../../types/interfaces.js";

export const arrayRule: RuleHandler = {
  validate: (value: any) => Array.isArray(value),
  message: () => "Must be an array",

  additionalRules: {
    each: (rule: RuleDefinition) => ({
      validate: (arr, [], ctx) => {
        // validate: (arr, params, ctx) => {
        const validator = new Validator({ "*": rule }, { schema: ctx.schema });
        return arr.every(
          (item: any, index: any) =>
            validator.validate({ [index]: item }).isValid
        );
      },
      message: () => "All items must be valid",
    }),
    min: () => ({
      // min: (min: number) => ({
      validate: (arr: any[], params: string[]) =>
        arr.length >= Number(params[0]),
      message: (params) => `Must have at least ${params[0]} items`,
    }),
    max: () => ({
      // max: (max: number) => ({
      validate: (arr: any[], params: string[]) =>
        arr.length <= Number(params[0]),
      message: (params) => `Cannot have more than ${params[0]} items`,
    }),
    distinct: () => ({
      // distinct: (key?: string) => ({
      validate: (arr: any[], params: string[]) => {
        const seen = new Set();
        return arr.every((item) => {
          const value = params[0] ? item[params[0]] : item;
          return seen.has(value) ? false : (seen.add(value), true);
        });
      },
      message: (params) =>
        params[0]
          ? `All ${params[0]} values must be unique`
          : "Duplicate items found",
    }),
    size: () => ({
      // size: (count: number) => ({
      validate: (arr: any[], params: string[]) =>
        arr.length === Number(params[0]),
      message: (params) => `Must contain exactly ${params[0]} items`,
    }),
  },
};
