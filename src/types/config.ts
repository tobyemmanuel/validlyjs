import { ValidationContext, ValidationResult } from ".";
import {
  PerformanceOptions,
  CoercionOptions,
  ValidationSchema,
  FluentRule,
  StringRule,
  ArrayRule,
  UnionRule,
  DataType,
  ResponseType
} from "./validators.js";
import { LanguagePack } from "./messages.js";
import { RuleResult, CompiledRule, Rule } from "./rules.js";
import { ResolvedField, PatternMatch } from "./parsers.js";

// Global configuration
export interface GlobalConfig {
  responseType: ResponseType;
  stopOnFirstError?: boolean,
  language: string;
  messages: Record<string, string>;
  fieldMessages: Record<string, string>;
  customLanguages?: Record<string, LanguagePack>;
  performance?: PerformanceOptions;
  errorHandling?: ErrorHandlingOptions;
  coercion?: CoercionOptions;
  debug?: boolean;
}

// Error handling options
export interface ErrorHandlingOptions {
  stopOnFirstError: boolean;
  includeFieldPath: boolean;
  includeRuleName: boolean;
  verboseErrors: boolean;
  includeStackTrace: boolean;
}

// Configuration preset
export interface ConfigPreset {
  name: string;
  config: Partial<GlobalConfig>;
}

// Environment-specific configuration
export interface EnvironmentConfig {
  development: Partial<GlobalConfig>;
  production: Partial<GlobalConfig>;
  test: Partial<GlobalConfig>;
}

// Performance measurement types
export interface PerformanceMeasurement {
  ruleName: string;
  executionTime: number;
  field: string;
  slow: boolean;
}

export interface ValidationPerformanceReport {
  totalTime: number;
  ruleCount: number;
  slowRules: PerformanceMeasurement[];
  fieldCount: number;
  asyncRuleCount: number;
}

// ============================================================================
// Additional utility types
// ============================================================================

// Type guards
export type TypeGuard<T> = (value: any) => value is T;

// File types (for File validation)
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  path?: string;
  dimensions?: {
    width?: number;
    height?: number;
  };
}

// Network types (for network validation rules)
export interface NetworkValidationOptions {
  allowPrivate?: boolean;
  allowLoopback?: boolean;
  protocols?: string[];
}

// Database integration types
export interface DatabaseValidationOptions {
  connection?: any;
  table?: string;
  column?: string;
  excludeId?: any;
}

// Async validation queue
export interface AsyncValidationTask {
  field: string;
  rule: string;
  value: any;
  parameters: any[];
  validator: (value: any, context: ValidationContext) => Promise<RuleResult>;
  context: ValidationContext;
  execute: () => Promise<RuleResult>;
  ruleName: string;
}

// Field dependency tracking
export interface FieldDependency {
  field: string;
  dependsOn: string[];
  type: "required" | "validation" | "conditional";
}

// Validation compilation cache
export interface ValidationCache {
  compiled: Map<string, CompiledRule[]>;
  dependencies: Map<string, FieldDependency[]>;
  lastCompiled: Map<string, number>;
}

// Union validation strategy
export type UnionStrategy = "first-pass" | "best-match" | "all-errors";

// Advanced validation options
export interface AdvancedValidationOptions {
  unionStrategy?: UnionStrategy;
  fieldDependencies?: FieldDependency[];
  customTypeCoercion?: Record<string, (value: any) => any>;
  validationHooks?: ValidationHooks;
}

// Validation hooks
export interface ValidationHooks {
  beforeValidation?: (
    data: any,
    schema: ValidationSchema
  ) => any | Promise<any>;
  afterValidation?: (
    result: ValidationResult,
    data: any
  ) => ValidationResult | Promise<ValidationResult>;
  beforeFieldValidation?: (
    field: string,
    value: any,
    rules: CompiledRule[]
  ) => any | Promise<any>;
  afterFieldValidation?: (
    field: string,
    result: RuleResult[],
    value: any
  ) => RuleResult[] | Promise<RuleResult[]>;
}

// Export all utility functions type signatures
export interface ValidationUtils {
  isRule: TypeGuard<Rule>;
  isFluentRule: TypeGuard<FluentRule>;
  isStringRule: TypeGuard<StringRule>;
  isArrayRule: TypeGuard<ArrayRule>;
  isUnionRule: TypeGuard<UnionRule>;
  coerceValue: (
    value: any,
    targetType: DataType,
    options: CoercionOptions
  ) => any;
  resolvePath: (obj: Record<string, any>, path: string) => ResolvedField;
  matchPattern: (path: string, pattern: string) => PatternMatch;
  formatBytes: (bytes: number) => string;
  parseSize: (size: string | number) => number;
}
