import { RuleHandler, ValidationContext } from "../../types/interfaces.js";
import { requiredRule } from "../common/Required.js";

export const requiredIfRule: RuleHandler = {
  validate: (value: any, params: string[], ctx: ValidationContext) => {
    const [otherField, expectedValue] = params;
    const otherValue = ctx.data[otherField];

    if (otherValue == expectedValue) {
      return requiredRule.validate(value, [], ctx); // Reuse the requiredRule validation
    }
    return true;
  },
  message: (params: string[], ctx: ValidationContext) => {
    const [otherField, expectedValue] = params;
    const customMessage = ctx.config.messages.required_if;

    if (typeof customMessage === "string") {
      // Replace placeholders if a custom message is provided
      return customMessage
        .replace(":other", otherField)
        .replace(":value", expectedValue);
    }

    // Fallback to default message
    return `${ctx.field} is required when ${otherField} is ${expectedValue}`;
  },
};
