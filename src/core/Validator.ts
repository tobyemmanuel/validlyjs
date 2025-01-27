import {
  Rule,
  SchemaDefinition,
  ValidationConfig,
  ValidationContext,
  ValidationResult,
} from "../types/interfaces.js";
import { parseRules } from "../parsers/index.js";
import { getRuleHandler } from "../rules/index.js";
import { defaultConfig, setLocale, getConfig } from "../config.js";
import { prepareValue } from "../utils/common.js";

export class Validator<T = any> {
  private rules: Map<keyof T, Rule[]>;
  private config: ValidationConfig;

  constructor(schema: SchemaDefinition<T>, config?: Partial<ValidationConfig>) {
    this.rules = new Map();
    this.config = { ...defaultConfig, schema, ...config };
    Object.entries(schema).forEach(([field, ruleDef]) => {
      this.rules.set(field as keyof T, parseRules(ruleDef));
    });
  }
  setLocale(locale: string): this {
    setLocale(locale);
    this.config = { ...this.config, ...getConfig() };
    return this;
  }
  validate(data: Record<string, any>): ValidationResult<T> {
    const errors = new Map<keyof T, string[]>();
    const cleanData: Partial<T> = {};

    for (const [field, rules] of this.rules.entries()) {
      const rawValue = data[field as string];
      const value = prepareValue(rawValue, this.config);
      const context: ValidationContext = {
        value,
        data,
        field: field as string,
        config: this.config,
        schema: this.config.schema,
        formatMessage: this.formatMessage.bind(this),
      };
      for (const rule of rules) {
        const handler = getRuleHandler(rule.name);
        const isValid = handler.validate(value, rule.params, context);

        if (!isValid) {
          const message = handler.message(rule.params, context);
          const fieldErrors = errors.get(field) || [];
          fieldErrors.push(message);
          errors.set(field, fieldErrors);
          if (this.config.bail) break;
        }
      }
      if (value !== undefined) cleanData[field] = value;
    }
    return {
      isValid: errors.size === 0,
      data: cleanData as T,
      errors: Object.fromEntries(errors) as Partial<Record<keyof T, string[]>>,
    };
  }

  async validateAsync(data: Record<string, any>): Promise<ValidationResult<T>> {
    const errors = new Map<keyof T, string[]>();
    const cleanData: Partial<T> = {};
    for (const [field, rules] of this.rules.entries()) {
      const rawValue = data[field as string];
      const value = prepareValue(rawValue, this.config);
      const context: ValidationContext = {
        value,
        data,
        field: field as string,
        config: this.config,
        schema: this.config.schema,
        formatMessage: this.formatMessage.bind(this),
      };
      for (const rule of rules) {
        const handler = getRuleHandler(rule.name);
        const isValid = await handler.validate(value, rule.params, context);

        if (!isValid) {
          const message = handler.message(rule.params, context);
          const fieldErrors = errors.get(field) || [];
          fieldErrors.push(message);
          errors.set(field, fieldErrors);
          if (this.config.bail) break;
        }
      }
      if (value !== undefined) cleanData[field] = value;
    }
    return {
      isValid: errors.size === 0,
      data: cleanData as T,
      errors: Object.fromEntries(errors) as Partial<Record<keyof T, string[]>>,
    };
  }

  private formatMessage(
    params: string[],
    defaultMessage: string | Record<string, string>
  ): string {
    if (typeof defaultMessage === "string") {
      return this.replaceMessageParams(defaultMessage, params);
    }
    if (typeof defaultMessage === "object") {
      const [ruleName, subKey] = params[0].split(".");
      if (ruleName && subKey && defaultMessage[ruleName]) {
        const message = defaultMessage[ruleName];
        if (typeof message === "string") {
          return this.replaceMessageParams(message, params);
        }
        if (typeof message === "object" && message[subKey]) {
          return this.replaceMessageParams(message[subKey], params);
        }
      }
    }
    return "Validation error";
  }
  private replaceMessageParams(message: string, params: string[]): string {
    return message.replace(/:(\w+)/g, (_, key) => {
      const paramIndex = Number(key);
      return !isNaN(paramIndex) && params[paramIndex] ? params[paramIndex] : "";
    });
  }
}
