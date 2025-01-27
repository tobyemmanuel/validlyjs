import { RuleHandler, RuleWithAdditional } from "../types/interfaces.js";
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
import { StringBuilder } from "../builders/StringBuilder.js";

const ruleRegistry = new Map<string, RuleHandler>();

export function registerRule(name: string, handler: RuleHandler) {
  ruleRegistry.set(name, handler);
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

function registerAdditionalRules(
  baseRule: RuleWithAdditional,
  converter: (param: string) => any
) {
  if (!baseRule.additionalRules) return;

  Object.entries(baseRule.additionalRules).forEach(([name, rule]) => {
    registerRule(name, {
      validate: (value, params, ctx) =>
        rule(...params.map(converter)).validate(value, params, ctx),
      message: (params, ctx) =>
        rule(...params.map(converter)).message(params, ctx),
    });
  });
}

const additionalRulesConfig: [RuleWithAdditional, (param: string) => any][] = [
  [stringRule, Number],
  [numberRule, Number],
  [dateRule, String],
];

additionalRulesConfig.forEach(([rule, converter]) => {
  registerAdditionalRules(rule, converter);
});

export function extend(
  name: string,
  handler: RuleHandler | ((value: any) => boolean | string)
) {
  if (typeof handler === "function") {
    ruleRegistry.set(name, {
      validate: (value: any, params: string[], ctx: any) => {
        const result = handler(value);
        if (result === true) return true;
        if (typeof result === "string") {
          ctx.formatMessage([], result);
          return false;
        }
        return false;
      },
      message: (params: string[], ctx: any) =>
        ctx.config.messages[name] || `Validation failed for rule: ${name}`,
    });
  } else {
    ruleRegistry.set(name, handler);
  }

  if (typeof StringBuilder !== "undefined") {
    StringBuilder.prototype[name] = function () {
      this.rules.push({ name, params: [] });
      return this;
    };
  }
}

export function getRuleHandler(name: string): RuleHandler {
  const handler = ruleRegistry.get(name);
  if (!handler) throw new Error(`Invalid validation rule [${name}]`);
  return handler;
}
