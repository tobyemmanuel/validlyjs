import { RuleHandler, ValidationContext } from "../../types/interfaces.js";

export const requiredRule: RuleHandler = {
  validate: (value: any) => {
    // validate: (value: any, params: string[], ctx: ValidationContext) => {
    if (value === undefined || value === null) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
  },
  message: ([], ctx: ValidationContext) => {
    // message: (params: string[], ctx: ValidationContext) => {
    const message = ctx.config.messages?.required;
    if (typeof message === "string") {
      return message;
    }
    return `${ctx.field} is required`;
  },
};

export function validateRequired(value: any): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function requiredMessage(ctx: ValidationContext): string {
  const message = ctx.config.messages?.required;
  if (typeof message === "string") {
    return message;
  }
  return `${ctx.field} is required`;
}
