import { RuleHandler, ValidationContext } from "../../types/interfaces.js";
import { Validator } from "../../core/Validator.js";
import { SchemaDefinition } from "../../types/interfaces.js";

export const objectRule: RuleHandler = {
  validate: (value: any) =>
    // validate: (value: any, params: string[], ctx: ValidationContext) =>
    typeof value === "object" && !Array.isArray(value) && value !== null,
  message: ([], ctx: ValidationContext) => {
    // message: (params: string[], ctx: ValidationContext) => {
    const message = ctx.config.messages?.object;
    return typeof message === "string"
      ? message.replace(/:attribute/g, ctx.field || "field")
      : `${ctx.field} must be an object`;
  },

  additionalRules: {
    shape: (schema: SchemaDefinition) => ({
      validate: (obj: object) => {
        // validate: (obj: object, params: string[], ctx: ValidationContext) => {
        const validator = new Validator(schema);
        return validator.validateAsync(obj).then((r) => r.isValid);
      },
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.shape;
        return typeof message === "string"
          ? message.replace(/:attribute/g, ctx.field || "field")
          : `${ctx.field} has an invalid structure`;
      }
    }),
    strict: () => ({
      validate: (obj: object, [], ctx: ValidationContext) => {
        // validate: (obj: object, params: string[], ctx: ValidationContext) => {
        if (!ctx.schema) {
          throw new Error("Schema is required for strict validation");
        }
        const extraKeys = Object.keys(obj).filter(
          (key) => !(key in ctx.schema!)
        );
        return extraKeys.length === 0;
      },
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.strict;
        return typeof message === "string"
          ? message.replace(/:attribute/g, ctx.field || "field")
          : `${ctx.field} contains unexpected fields`;
      }
    })
  }
};