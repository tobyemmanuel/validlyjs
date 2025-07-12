import { CompiledRule, Rule, RuleResult } from '../../types/rules';
import { ValidationContext } from '../../types';
import { RuleEngine } from '../../core/rule-engine';
import { ParsedRule } from '../../types/parsers';
import { RuleCompiler } from '../../core/performance/compiler';

// Cache instances to avoid repeated instantiation
let cachedRuleEngine: RuleEngine | null = null;
let cachedCompiler: RuleCompiler | null = null;

const getRuleEngine = (): RuleEngine => {
  if (!cachedRuleEngine) {
    cachedRuleEngine = new RuleEngine();
  }
  return cachedRuleEngine;
};

const getCompiler = (): RuleCompiler => {
  if (!cachedCompiler) {
    cachedCompiler = new RuleCompiler(getRuleEngine());
  }
  return cachedCompiler;
};

// Rule descriptions cache for better performance
const ruleDescriptionsCache = new Map<string, string>();

/**
 * Union rule - validates that value passes at least one of the provided rule sets
 * Provides detailed format information for better user experience
 */
export const unionRule: Rule = {
  name: 'union',
  validate: async (
    value: any,
    parameters: any[],
    field: string,
    data: Record<string, any>
  ): Promise<boolean> => {
    const ruleSets = parameters[0];
    const stopOnFirstPass = parameters[1] !== false; // Default true
    const performanceOptions = parameters[2] || {};
    const { optimizeUnions = true, parallelValidation = false } = performanceOptions;
    
    if (!ruleSets || !Array.isArray(ruleSets) || ruleSets.length === 0) {
      return false;
    }

    const compiler = getCompiler();

    // Pre-allocate context to avoid repeated object creation
    const context: ValidationContext = {
      field,
      data,
      path: field,
    };

    const formatDescriptions: string[] = [];

    // Use parallel validation if enabled and multiple rule sets
    if (parallelValidation && ruleSets.length > 1) {
      return await validateInParallel(ruleSets, value, context, compiler, formatDescriptions);
    }

    // Use optimized validation (with caching)
    if (optimizeUnions) {
      return await validateOptimized(ruleSets, value, context, compiler, formatDescriptions, stopOnFirstPass);
    }

    // Fallback to current sequential implementation
    return await validateSequential(ruleSets, value, context, compiler, formatDescriptions, stopOnFirstPass);
  },

  message: 'The {field} field must match one of these formats: {formats}',
  async: true,
  priority: 1,
};

/**
 * Validate rule sets in parallel
 */
async function validateInParallel(
  ruleSets: ParsedRule[][],
  value: any,
  context: ValidationContext,
  compiler: RuleCompiler,
  _formatDescriptions: string[]
): Promise<boolean> {
  const len = ruleSets.length;
  const promises = new Array(len);
  
  for (let i = 0; i < len; i++) {
    promises[i] = validateRuleSet(ruleSets[i] as ParsedRule[], value, context, compiler);
  }

  const results = await Promise.all(promises);
  
  // Check if any rule set passed
  for (let i = 0; i < len; i++) {
    if (results[i]) return true;
  }
  
  return false;
}

/**
 * Validate with optimization (caching)
 */
async function validateOptimized(
  ruleSets: ParsedRule[][],
  value: any,
  context: ValidationContext,
  compiler: RuleCompiler,
  formatDescriptions: string[],
  _stopOnFirstPass: boolean
): Promise<boolean> {
  // Simple rule set caching for optimization
  const ruleCache = new Map<string, boolean>();
  const len = ruleSets.length;
  
  for (let i = 0; i < len; i++) {
    const ruleSet = ruleSets[i];
    const cacheKey = JSON.stringify(ruleSet) + JSON.stringify(value);
    
    // Check cache first
    if (ruleCache.has(cacheKey)) {
      const cachedResult = ruleCache.get(cacheKey);
      if (cachedResult) {
        return true;
      }
      continue;
    }

    const result = await validateRuleSetWithDescription(ruleSet as ParsedRule[], value, context, compiler, formatDescriptions);
    
    // Cache the result
    ruleCache.set(cacheKey, result);
    
    if (result) {
      return true;
    }
  }

  // Store format descriptions for message resolver
  storeFormatDescriptions(formatDescriptions);
  return false;
}

/**
 * Original sequential validation (fallback)
 */
async function validateSequential(
  ruleSets: ParsedRule[][],
  value: any,
  context: ValidationContext,
  compiler: RuleCompiler,
  formatDescriptions: string[],
  _stopOnFirstPass: boolean
): Promise<boolean> {
  const len = ruleSets.length;
  
  for (let i = 0; i < len; i++) {
    const result = await validateRuleSetWithDescription(ruleSets[i] as ParsedRule[], value, context, compiler, formatDescriptions);
    
    if (result) {
      return true;
    }
  }

  // Store format descriptions for message resolver
  storeFormatDescriptions(formatDescriptions);
  return false;
}

/**
 * Validate a single rule set (optimized)
 */
async function validateRuleSet(
  ruleSet: ParsedRule[],
  value: any,
  context: ValidationContext,
  compiler: RuleCompiler
): Promise<boolean> {
  try {
    const compiledRules = compiler.compile(ruleSet) as CompiledRule[];
    const len = compiledRules.length;
    
    // All rules in this set must pass
    for (let i = 0; i < len; i++) {
      const compiledRule = compiledRules[i] as CompiledRule;
      let result: RuleResult;
      
      if (compiledRule.async) {
        result = await compiledRule.validator(value, context);
      } else {
        const syncResult = compiledRule.validator(value, context);
        result = syncResult instanceof Promise ? await syncResult : syncResult;
      }
      
      if (!result.passed) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate a single rule set with description collection
 */
async function validateRuleSetWithDescription(
  ruleSet: ParsedRule[],
  value: any,
  context: ValidationContext,
  compiler: RuleCompiler,
  formatDescriptions: string[]
): Promise<boolean> {
  try {
    const compiledRules = compiler.compile(ruleSet);
    let allRulesPassed = true;
    const ruleDescriptions: string[] = [];
    const len = compiledRules.length;

    // All rules in this set must pass
    for (let i = 0; i < len; i++) {
      const compiledRule = compiledRules[i] as CompiledRule;
      let result: RuleResult;

      if (compiledRule.async) {
        result = await compiledRule.validator(value, context);
      } else {
        const syncResult = compiledRule.validator(value, context);
        result = syncResult instanceof Promise ? await syncResult : syncResult;
      }

      if (!result.passed) {
        allRulesPassed = false;
        ruleDescriptions.push(
          getRuleDescription(compiledRule.name, compiledRule.parameters)
        );
        break; // Early exit for this rule set
      }
    }

    // If this rule set passed completely, union passes
    if (allRulesPassed) {
      return true;
    }

    // Add format description for this rule set
    if (ruleDescriptions.length > 0) {
      formatDescriptions.push(ruleDescriptions.join(' and '));
    } else {
      // Fallback: describe the rule set
      const ruleNames = compiledRules.map((r) => r.name).join(', ');
      formatDescriptions.push(ruleNames);
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Store format descriptions for message resolver
 */
function storeFormatDescriptions(formatDescriptions: string[]): void {
  if (formatDescriptions.length > 0) {
    (global as any).lastUnionFormats = formatDescriptions;
  } else {
    delete (global as any).lastUnionFormats;
  }
}

/**
 * Generate rule description using simple rule name mapping (cached)
 */
function getRuleDescription(ruleName: string, parameters?: any[]): string {
  const cacheKey = ruleName + JSON.stringify(parameters);
  
  if (ruleDescriptionsCache.has(cacheKey)) {
    return ruleDescriptionsCache.get(cacheKey)!;
  }

  let description: string;
  
  // Simple mapping of common rules to their descriptions
  switch (ruleName) {
    case 'string.email':
      description = 'a valid email address';
      break;
    case 'string.min':
      description = `at least ${parameters?.[0] || 'N'} characters`;
      break;
    case 'string.max':
      description = `at most ${parameters?.[0] || 'N'} characters`;
      break;
    case 'string.length':
      description = `exactly ${parameters?.[0] || 'N'} characters`;
      break;
    case 'string.uuid':
      description = 'a valid UUID';
      break;
    case 'string.url':
      description = 'a valid URL';
      break;
    case 'string.alpha':
      description = 'only alphabetic characters';
      break;
    case 'string.alphanumeric':
      description = 'only alphanumeric characters';
      break;
    case 'string.numeric':
      description = 'only numeric characters';
      break;
    case 'number.min':
      description = `at least ${parameters?.[0] || 'N'}`;
      break;
    case 'number.max':
      description = `at most ${parameters?.[0] || 'N'}`;
      break;
    case 'number.between':
      description = `between ${parameters?.[0] || 'N'} and ${parameters?.[1] || 'N'}`;
      break;
    case 'number.integer':
      description = 'a whole number';
      break;
    case 'number.positive':
      description = 'a positive number';
      break;
    case 'number.negative':
      description = 'a negative number';
      break;
    case 'date.after':
      description = `after ${parameters?.[0] || 'specified date'}`;
      break;
    case 'date.before':
      description = `before ${parameters?.[0] || 'specified date'}`;
      break;
    case 'date.format':
      description = `in ${parameters?.[0] || 'specified'} format`;
      break;
    case 'array.min':
      description = `at least ${parameters?.[0] || 'N'} items`;
      break;
    case 'array.max':
      description = `at most ${parameters?.[0] || 'N'} items`;
      break;
    case 'array.length':
      description = `exactly ${parameters?.[0] || 'N'} items`;
      break;
    case 'file.max':
      description = `at most ${parameters?.[0] || 'N'} bytes`;
      break;
    case 'file.min':
      description = `at least ${parameters?.[0] || 'N'} bytes`;
      break;
    case 'file.mimes':
      description = `one of these types: ${parameters?.[0]?.join?.(', ') || 'specified types'}`;
      break;
    case 'required':
      description = 'required';
      break;
    case 'boolean':
      description = 'true or false';
      break;
    default:
      description = ruleName.replace(/\./g, ' ');
  }

  ruleDescriptionsCache.set(cacheKey, description);
  return description;
}