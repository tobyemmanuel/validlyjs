import { RuleHandler, ValidationContext } from "../../types/interfaces.js";

export const dateRule: RuleHandler = {
  validate: (value: any) =>
    // validate: (value: any, params: string[], ctx: ValidationContext) =>
    !isNaN(Date.parse(value)),
  message: ([], ctx: ValidationContext) => {
    // message: (params: string[], ctx: ValidationContext) => {
    const message = ctx.config.messages?.date;
    return typeof message === "string"
      ? message.replace(/:attribute/g, ctx.field || "field")
      : `${ctx.field} must be a valid date`;
  },

  additionalRules: {
    after: (date: string) => ({
      validate: (value: any) =>
        // validate: (value: any, params: string[], ctx: ValidationContext) =>
        new Date(value) > new Date(date),
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.after;
        return typeof message === "string"
          ? message
              .replace(/:attribute/g, ctx.field || "field")
              .replace(/:date/g, date)
          : `${ctx.field} must be after ${date}`;
      }
    }),
    before: (date: string) => ({
      validate: (value: any) =>
        // validate: (value: any, params: string[], ctx: ValidationContext) =>
        new Date(value) < new Date(date),
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.before;
        return typeof message === "string"
          ? message
              .replace(/:attribute/g, ctx.field || "field")
              .replace(/:date/g, date)
          : `${ctx.field} must be before ${date}`;
      }
    }),
    date_equals: (date: string) => ({
      validate: (value: any) =>
        // validate: (value: any, params: string[], ctx: ValidationContext) =>
        new Date(value).toDateString() === new Date(date).toDateString(),
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages?.date_equals;
        return typeof message === "string"
          ? message
              .replace(/:attribute/g, ctx.field || "field")
              .replace(/:date/g, date)
          : `${ctx.field} must be equal to ${date}`;
      }
    })
  }
};