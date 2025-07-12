import { CompiledRule } from './rules.js';
// Main rule definition types (supports all three formats)
export type RuleDefinition = FluentRule | StringRule | ArrayRule | UnionRule;

// Fluent rule interface
export interface FluentRule {
  _type: 'fluent';
  _rules: CompiledRule[];
  _dataType: DataType;
  _modifiers: RuleModifier[];

  // Core modifiers
  required(): FluentRule;
  nullable(): FluentRule;
  optional(): FluentRule;

  // Custom rule
  custom(name: string, parameters?: any[]): FluentRule;

  // Conditional requirements
  requiredIf(field: string, value: any | ((value: any) => boolean)): FluentRule;
  requiredWith(...fields: string[]): FluentRule;
  requiredWithAll(fields: string[]): FluentRule;
  requiredWithout(...fields: string[]): FluentRule;
  requiredWithoutAll(fields: string[]): FluentRule;
  requiredUnless(field: string, value: any): FluentRule;
  when(field: string, conditions: WhenConditions): FluentRule;
}

export interface WhenConditions {
  [key: string]: {
    [operator: string]: any;
  } | any;
  then?: RuleDefinition;
  otherwise?: RuleDefinition;
}

// String rule interface
export type StringRule = string;

// Array rule interface
export type ArrayRule = string[] | string[][];

// Union rule interface
export interface UnionRule {
  _type: 'union';
  rules: RuleDefinition[];
  stopOnFirstPass?: boolean;
}

// Data types
export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'file'
  | 'array'
  | 'object'
  | 'union'
  | 'custom'
  | 'any';

// Rule modifiers
export interface RuleModifier {
  type: 'required' | 'nullable' | 'optional' | 'conditional';
  parameters?: any[];
}

// Fluent builder interfaces for each data type
export interface StringFluentRule extends FluentRule {
  min(length: number): StringFluentRule;
  max(length: number): StringFluentRule;
  length(length: number): StringFluentRule;
  email(): StringFluentRule;
  url(): StringFluentRule;
  regex(pattern: RegExp): StringFluentRule;
  alpha(): StringFluentRule;
  alphaNum(): StringFluentRule;
  alphaNumDash(): StringFluentRule;
  uuid(): StringFluentRule;
  json(): StringFluentRule;
  startsWith(prefix: string): StringFluentRule;
  endsWith(suffix: string): StringFluentRule;
  contains(substring: string): StringFluentRule;
  in(values: string[]): StringFluentRule;
  notIn(values: string[]): StringFluentRule;
}

export interface NumberFluentRule extends FluentRule {
  min(value: number): NumberFluentRule;
  max(value: number): NumberFluentRule;
  between(min: number, max: number): NumberFluentRule;
  positive(): NumberFluentRule;
  negative(): NumberFluentRule;
  integer(): NumberFluentRule;
  decimal(places?: number): NumberFluentRule;
  multipleOf(value: number): NumberFluentRule;
}

export interface BooleanFluentRule extends FluentRule {
  true(): BooleanFluentRule;
  false(): BooleanFluentRule;
}

export interface DateFluentRule extends FluentRule {
  after(date: string | Date): DateFluentRule;
  before(date: string | Date): DateFluentRule;
  afterOrEqual(date: string | Date): DateFluentRule;
  beforeOrEqual(date: string | Date): DateFluentRule;
  format(format: string): DateFluentRule;
  timezone(timezone: string): DateFluentRule;
  weekday(): DateFluentRule;
  weekend(): DateFluentRule;
}

export interface FileFluentRule extends FluentRule {
  mimeTypes(types: string[]): FileFluentRule;
  extensions(extensions: string[]): FileFluentRule;
  size(): FileSizeFluentRule;
  image(): FileFluentRule;
  dimensions(): FileDimensionsFluentRule;
}

export interface FileSizeFluentRule extends FileFluentRule {
  min(size: string | number): FileFluentRule;
  max(size: string | number): FileFluentRule;
}

export interface FileDimensionsFluentRule extends FileFluentRule {
  width(width: number): FileFluentRule;
  height(height: number): FileFluentRule;
  minWidth(width: number): FileFluentRule;
  maxWidth(width: number): FileFluentRule;
  minHeight(height: number): FileFluentRule;
  maxHeight(height: number): FileFluentRule;
}

export interface NetworkFluentRule extends FluentRule {
  port(): NetworkFluentRule;
  domain(): NetworkFluentRule;
}

export interface ArrayFluentRule extends FluentRule {
  min(length: number): ArrayFluentRule;
  max(length: number): ArrayFluentRule;
  length(length: number): ArrayFluentRule;
  each(rule: RuleDefinition): ArrayFluentRule;
  unique(): ArrayFluentRule;
  contains(value: any): ArrayFluentRule;
}

export interface ObjectFluentRule extends FluentRule {
  shape(schema: Record<string, RuleDefinition>): ObjectFluentRule;
  keys(keys: string[]): ObjectFluentRule;
  strict(): ObjectFluentRule;
}

// Schema definition
export type ValidationSchema = Record<string, RuleDefinition>;

// Validator options
export interface ValidatorOptions {
  responseType?: ResponseType;
  language?: string;
  messages?: Record<string, string>;
  fieldMessages?: Record<string, string>;
  stopOnFirstError?: boolean;
  coercion?: CoercionOptions;
  performance?: PerformanceOptions;
  debug?: boolean;
}

export interface CoercionOptions {
  enabled?: boolean;
  strings?: boolean;
  numbers?: boolean;
  booleans?: boolean;
  dates?: boolean;
}

export interface PerformanceOptions {
  cacheRules?: boolean;
  optimizeUnions?: boolean;
  parallelValidation?: boolean;
  compileRules?: boolean;
}

// Response types
export type ResponseType = 'laravel' | 'flat' | 'grouped' | 'nested';

// Validation response formats
export interface LaravelResponse {
  [field: string]: string[];
}

export interface FlatResponse {
  [field: string]: string;
}

export interface GroupedResponse {
  [group: string]: {
    [field: string]: string[];
  };
}

export interface NestedResponse {
  [field: string]:
    | {
        [rule: string]: string;
      }
    | NestedResponse;
}
