export * from './core/index';
export * from './string/index';
export * from './number/index';
export * from './date/index';
export * from './file/index';
export * from './array/index'; 
export * from './object/index';
export * from './boolean/index';
export * from './network/index';

// Re-export commonly used rule types
export type {
  Rule,
  StringRuleParams,
  NumberRuleParams,
  DateRuleParams,
  FileRuleParams,
  ArrayRuleParams,
  ObjectRuleParams,
  ConditionalRuleParams,
  UnionRuleParams,
  CustomRule,
  RuleRegistry,
  RuleResult,
  CompiledRule
} from '../types/rules';

// Rule registry instance
import { RuleRegistry } from '../types/rules';
export const globalRuleRegistry: RuleRegistry = new Map();