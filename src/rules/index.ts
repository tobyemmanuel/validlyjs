import {
  RuleHandler,
  AdditionalRule,
  ValidationContext,
} from "../types/interfaces.js";
import { requiredRule } from "./common/Required.js";
import { stringRule } from "./common/String.js";
import { numberRule } from "./common/Number.js";
import { arrayRule } from "./common/Array.js";
import { objectRule } from "./common/Object.js";
import { booleanRule } from "./common/Boolean.js";
import { fileRule } from "./file/File.js";
import { requiredIfRule } from "./conditional/RequiredIf.js";
import { requiredUnlessRule } from "./conditional/RequiredUnless.js";
import { requiredWithRule } from "./conditional/RequiredWith.js";
import { dateRule } from "./common/Date.js";

const ruleRegistry = new Map<string, RuleHandler>();
const additionalRuleRegistry: Record<
  string,
  Record<string, AdditionalRule>
> = {};
const customRules = new Map<string, RuleHandler>();

export function registerRule(name: string, handler: RuleHandler) {
  ruleRegistry.set(name, handler);
}

function registerAdditionalRule(
  baseRuleName: string,
  ruleName: string,
  rule: AdditionalRule
) {
  if (!additionalRuleRegistry[baseRuleName]) {
    additionalRuleRegistry[baseRuleName] = {};
  }
  additionalRuleRegistry[baseRuleName][ruleName] = rule;
}

const baseRules: Record<string, RuleHandler> = {
  required: requiredRule,
  string: stringRule,
  number: numberRule,
  array: arrayRule,
  date: dateRule,
  object: objectRule,
  boolean: booleanRule,
  file: fileRule,
  required_if: requiredIfRule,
  required_unless: requiredUnlessRule,
  required_with: requiredWithRule,
};

Object.entries(baseRules).forEach(([name, rule]) => {
  registerRule(name, rule);
});

function registerAllAdditionalRules() {
  for (const [baseRuleName, ruleHandler] of Object.entries(baseRules)) {
    if ("additionalRules" in ruleHandler && ruleHandler.additionalRules) {
      for (const [additionalRuleName, ruleFactory] of Object.entries(
        ruleHandler.additionalRules
      )) {
        registerAdditionalRule(baseRuleName, additionalRuleName, ruleFactory());
      }
    }
  }
}

// Call this function to register all rules
registerAllAdditionalRules();

export function extend(
  name: string,
  validate: (value: any) => boolean | string,
  message?: string | ((ctx: ValidationContext) => string)
) {
  customRules.set(name, {
    validate: (value: any, params: string[], ctx: ValidationContext) => {
      const result = validate(value);
      if (result === true) return true;
      if (typeof result === "string") {
        return false;
      }
      return false;
    },
    message: (params: string[], ctx: ValidationContext) => {
      if (typeof message === "function") {
        return message(ctx);
      }
      if (typeof message === "string") {
        return ctx.formatMessage({ attribute: ctx.field || "field" }, message);
      }
      const result = validate(ctx.value);
      return typeof result === "string"
        ? ctx.formatMessage({ attribute: ctx.field || "field" }, result)
        : `Validation failed for rule: ${name}`;
    },
  });
}

export function registerCustomRule(name: string, handler: RuleHandler) {
  customRules.set(name, handler);
}

export function getCustomRuleHandler(name: string): RuleHandler {
  const handler = customRules.get(name);
  if (!handler) throw new Error(`Invalid custom validation rule [${name}]`);
  return handler;
}

export function getRuleHandler(
  name: string,
  baseDataType?: string
): RuleHandler {
  // First, check for custom rules since they're identified by 'custom'
  if (name === "custom") {
    return {
      validate: (value: any, params: string[], ctx: ValidationContext) => {
        if (params.length === 0) throw new Error("No custom rule specified");
        const customRuleName = params[0];
        const customRule = customRules.get(customRuleName);
        if (!customRule)
          throw new Error(`Custom rule [${customRuleName}] not found`);
        return customRule.validate(value, params.slice(1), ctx);
      },
      message: (params: string[], ctx: ValidationContext) => {
        const customRuleName = params[0];
        const customRule = customRules.get(customRuleName);
        if (!customRule)
          throw new Error(`Custom rule [${customRuleName}] not found`);
        return customRule.message(params.slice(1), ctx);
      },
    };
  }

  // Check base rule registry
  const baseRuleHandler = ruleRegistry.get(name);
  if (baseRuleHandler) return baseRuleHandler;

  // Check additional rules for the specific data type
  if (baseDataType && additionalRuleRegistry[baseDataType]?.[name]) {
    return additionalRuleRegistry[baseDataType][name];
  }

  // If no specific data type, check all additional rules
  for (const [baseRuleName, additionalRules] of Object.entries(
    additionalRuleRegistry
  )) {
    if (name in additionalRules) {
      return additionalRules[name];
    }
  }

  throw new Error(
    `Invalid validation rule [${name}] for data type ${
      baseDataType || "unknown"
    }`
  );
}
