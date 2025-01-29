export interface Rule {
  name: string;
  params: string[];
  custom?: boolean;
}

export interface RuleHandler {
  validate: (
    value: any,
    params: string[],
    ctx: ValidationContext
  ) => boolean | Promise<boolean>;
  message: (params: string[], ctx: ValidationContext) => string;
  additionalRules?: Record<string, (...args: any[]) => AdditionalRule>;
}

export type AdditionalRule = {
  validate: (value: any, params: string[], ctx: ValidationContext) => boolean | Promise<boolean>;
  message: (params: string[], ctx: ValidationContext) => string;
};

export interface RuleBuilder {
  rules: Rule[];
}

export type RuleDefinition = string | string[] | RuleBuilder;

export type SchemaDefinition<T = any> = Record<keyof T, RuleDefinition>;

export type RuleWithAdditional = RuleHandler & {
  additionalRules?: Record<string, (...args: any[]) => AdditionalRule>;
};

export interface ValidationResult<T> {
  isValid: boolean;
  data: T;
  errors: Partial<Record<keyof T, string[]>>;
}

export interface ValidationContext {
  data: any;
  value?: any;
  field?: string;
  config: ValidationConfig;
  formatMessage: (params: Record<string, string>, defaultMessage: string) => string;
  schema?: SchemaDefinition;
}

export interface ValidationConfig {
  bail: boolean;
  autoTrim: boolean;
  convertEmptyStringToNull: boolean;
  locale: string;
  messages: ValidationMessages;
  schema?: SchemaDefinition;
}

export interface ValidationMessages {
  [key: string]: string | { [key: string]: string };
}

export function hasSchema(
  ctx: ValidationContext
): ctx is ValidationContext & { schema: SchemaDefinition } {
  return !!ctx.schema;
}

export interface DefaultMessages {
  default: string;
  required: string;
  min: string;
  max: string;
  email: string;
  alpha: string;
  alpha_num: string;
  uuid: string;
  [key: string]: string;
}
