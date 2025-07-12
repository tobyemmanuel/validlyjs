import {
  RuleDefinition,
  RuleModifier,
  DataType,
  ValidationSchema,
} from './validators.js';
import { GlobalConfig } from './config.js';

// Parser interface
export interface Parser<T = RuleDefinition> {
  // parse(input: any): ParsedRule[];
  parse(input: T): ParsedRule[] | ParsedRule[][];
  canParse(input: any): boolean;
  priority: number;
}

// Parsed rule structure
export interface ParsedRule {
  name: string;
  parameters: any[];
  dataType?: DataType;
  modifiers: RuleModifier[];
  async?: boolean;
  isModifier?: boolean;
  isUnion?: boolean;
}

// Parser context
export interface ParseContext {
  field: string;
  schema: ValidationSchema;
  globalConfig: GlobalConfig;
}

// Fluent parser specific types
export interface FluentParseResult {
  rules: ParsedRule[];
  dataType: DataType;
}

// String parser specific types
export interface StringParseResult {
  rules: ParsedRule[];
  dataType?: DataType;
}

// Array parser specific types
export interface ArrayParseResult {
  rules: ParsedRule[];
  dataType?: DataType;
}

// Union parser specific types
export interface UnionParseResult {
  unionRules: ParsedRule[][];
  stopOnFirstPass: boolean;
}

// Dot notation parser types
export interface DotNotationField {
  originalPath: string;
  normalizedPath: string;
  segments: string[];
  wildcards: WildcardSegment[];
  isWildcard: boolean;
}

export interface WildcardSegment {
  index: number;
  type: 'array' | 'object';
  pattern: string;
}

// Field resolution types
export interface ResolvedField {
  path: string;
  value: any;
  exists: boolean;
  parentPath?: string;
  key?: string | number;
}

// Pattern matching types
export interface PatternMatch {
  matched: boolean;
  captures: Record<string, any>;
  path: string;
}
