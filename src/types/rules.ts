import { ValidationContext } from '.';
import { RuleDefinition } from './validators.js';

// Base rule interface
export interface Rule {
  name: string;
  validate: (
    value: any,
    parameters: any[],
    field: string,
    data: Record<string, any>
  ) => boolean | Promise<boolean>;
  message?: string;
  async?: boolean;
  priority?: number;
}

// Rule parameter types for each rule category
export interface StringRuleParams {
  min?: number;
  max?: number;
  length?: number;
  pattern?: RegExp;
  startsWith?: string;
  endsWith?: string;
  contains?: string;
  in?: string[];
  notIn?: string[];
}

export interface NumberRuleParams {
  min?: number;
  max?: number;
  between?: [number, number];
  multipleOf?: number;
  precision?: number;
}

export interface DateRuleParams {
  after?: string | Date;
  before?: string | Date;
  afterOrEqual?: string | Date;
  beforeOrEqual?: string | Date;
  format?: string;
  timezone?: string;
}

export interface FileRuleParams {
  mimeTypes?: string[];
  extensions?: string[];
  minSize?: number | string;
  maxSize?: number | string;
  dimensions?: {
    width?: number;
    height?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
}

export interface ArrayRuleParams {
  min?: number;
  max?: number;
  length?: number;
  unique?: boolean;
  contains?: any;
  each?: RuleDefinition;
}

export interface ObjectRuleParams {
  shape?: Record<string, RuleDefinition>;
  keys?: string[];
  strict?: boolean;
}

// Conditional rule parameters
export interface ConditionalRuleParams {
  requiredIf?: [string, any] | [string, (value: any) => boolean];
  requiredWith?: string[];
  requiredWithAll?: string[];
  requiredWithout?: string[];
  requiredWithoutAll?: string[];
  requiredUnless?: [string, any];
}

// Union rule parameters
export interface UnionRuleParams {
  rules: RuleDefinition[];
  stopOnFirstPass?: boolean;
}

// Custom rule definition
export interface CustomRule extends Rule {
  parameters?: any[];
}

export interface CustomRuleDefinition {
  validate: (
    value: any,
    parameters: any[],
    field: string,
    data: Record<string, any>
  ) => boolean | Promise<boolean>;
  message: string;
  async?: boolean;
  priority?: number;
}

// Rule registry type
export type RuleRegistry = Map<string, Rule>;

// Rule execution result
export interface RuleResult {
  passed: boolean;
  message?: string;
  skip?: boolean;
}

// Compiled rule for performance
export interface CompiledRule {
  name: string;
  validator: (
    value: any,
    context: ValidationContext
  ) => RuleResult | Promise<RuleResult>;
  async: boolean;
  dependencies?: string[];
  parameters?: any[];
}

export interface Plugin {
  name: string;
  rules?: Record<string, Rule | CustomRuleDefinition>;
  init?: () => void;
  cleanup?: () => void;
}
