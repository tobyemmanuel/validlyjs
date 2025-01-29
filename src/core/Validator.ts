import {
  Rule,
  SchemaDefinition,
  ValidationConfig,
  ValidationContext,
  ValidationResult,
  AdditionalRule,
  RuleHandler,
} from "../types/interfaces.js";
import { parseRules } from "../parsers/index.js";
import { getRuleHandler } from "../rules/index.js";
import { defaultConfig, setLocale, getConfig } from "../config.js";
import { prepareValue } from "../utils/common.js";
import { DATA_TYPES } from "../utils/typeCheck.js";

export class Validator<T = any> {
  private rules: Map<keyof T, Rule[]>;
  private config: ValidationConfig;

  constructor(schema: SchemaDefinition<T>, config?: Partial<ValidationConfig>) {
    this.rules = new Map();
    this.config = { ...defaultConfig, schema, ...config };

    Object.entries(schema).forEach(([field, ruleDef]) => {
      const rules = parseRules(ruleDef);
      const dataTypeRules = rules.filter(
        (rule) => DATA_TYPES.includes(rule.name) && !rule.custom
      );

      if (dataTypeRules.length > 1) {
        throw new Error(
          `Field "${field}" cannot have more than one data type rule (string, number, boolean, array, date, file or object).`
        );
      }
      this.rules.set(field as keyof T, rules);
    });
  }

  setLocale(locale: string): this {
    setLocale(locale);
    this.config = { ...this.config, ...getConfig() };
    return this;
  }

  private updateCleanData(field: string, value: any, cleanData: any) {
    const parts = field.split(".");
    let target = cleanData;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (!target[key]) {
        if (!isNaN(Number(parts[i + 1]))) {
          target[key] = [];
        } else {
          target[key] = {};
        }
      }
      target = target[key];
    }
    target[parts[parts.length - 1]] = value;
  }

  private async validateField(
    field: string,
    rules: Rule[],
    data: Record<string, any>,
    cleanData: Partial<T>,
    errors: Map<keyof T, string[]>,
    isAsync = false
  ) {
    const parts = field.split(".");
    let currentObj = data;
    let value: any = null;
    let isValid = true;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (currentObj === undefined || currentObj === null) {
        isValid = false;
        break;
      }
      if (i === parts.length - 1) {
        value = currentObj[part];
      } else {
        currentObj = currentObj[part];
      }
    }

    if (!isValid) {
      errors.set(field as keyof T, ["The specified path does not exist"]);
      return;
    }

    const isNullable = rules.some((rule) => rule.name === "nullable");
    const isRequired = rules.some((rule) => rule.name === "required");

    if (isNullable && (value === null || value === undefined)) {
      this.updateCleanData(field, value, cleanData);
      return;
    }

    if (isRequired && (value === null || value === undefined || value === "")) {
      const handler = getRuleHandler("required");
      const message = handler.message([], {
        value,
        data,
        field,
        config: this.config,
        schema: this.config.schema,
        formatMessage: this.formatMessage.bind(this),
      });
      errors.set(field as keyof T, [message]);
      return;
    }

    const preparedValue = prepareValue(value, this.config);
    const context: ValidationContext = {
      value: preparedValue,
      data,
      field,
      config: this.config,
      schema: this.config.schema,
      formatMessage: this.formatMessage.bind(this),
    };

    const dataType = rules.find((rule) => DATA_TYPES.includes(rule.name))?.name;

    for (const rule of rules) {
      if (rule.name === "nullable") continue;
      try {
        const handler = getRuleHandler(rule.name, dataType);
        let validationResult;
        if (isAsync) {
          validationResult = await handler.validate(
            preparedValue,
            rule.params,
            context
          );
        } else {
          validationResult = handler.validate(
            preparedValue,
            rule.params,
            context
          );
        }
        if (!validationResult) {
          const message = handler.message(rule.params, context);
          const fieldErrors = errors.get(field as keyof T) || [];
          fieldErrors.push(message);
          errors.set(field as keyof T, fieldErrors);
          if (this.config.bail) break;
        }
      } catch (error: any) {
        console.error(
          `Validation error for rule ${rule.name} on field ${field}: `,
          error.message
        );
      }
    }

    if (value !== undefined) {
      this.updateCleanData(field, value, cleanData);
    }
  }

  validate(data: Record<string, any>): ValidationResult<T> {
    const errors = new Map<keyof T, string[]>();
    const cleanData: Partial<T> = {};

    for (const [field, rules] of this.rules.entries()) {
      this.validateField(
        field as string,
        rules,
        data,
        cleanData,
        errors,
        false
      );
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
      await this.validateField(
        field as string,
        rules,
        data,
        cleanData,
        errors,
        true
      );
    }

    return {
      isValid: errors.size === 0,
      data: cleanData as T,
      errors: Object.fromEntries(errors) as Partial<Record<keyof T, string[]>>,
    };
  }

  private formatMessage(
    params: Record<string, string>,
    defaultMessage: string | Record<string, string>
  ): string {
    if (typeof defaultMessage === "string") {
      return this.replaceMessageParams(defaultMessage, params);
    }
    if (typeof defaultMessage === "object") {
      const [ruleName, subKey] = Object.keys(params)[0].split(".");
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

  private replaceMessageParams(
    message: string,
    params: Record<string, string>
  ): string {
    return message.replace(/:(\w+)/g, (_, key) => params[key] || "");
  }
}

export { ValidationResult } from "../types/interfaces.js";
