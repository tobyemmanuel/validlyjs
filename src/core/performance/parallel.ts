import { ValidationContext, RuleResult, RuleDefinition } from '../../types';
import { RuleEngine } from '../rule-engine';
import { MessageResolver } from '../../messages/message-resolver';

export class ParallelValidator {
  private static ruleEngine = new RuleEngine();
  private static messageResolver = new MessageResolver({ language: 'en' });

  static async validateBatch(
    values: any[],
    rules: RuleDefinition[],
    contexts: ValidationContext[]
  ): Promise<RuleResult[]> {
    const batchSize = 50;
    const results: RuleResult[] = [];

    for (let i = 0; i < values.length; i += batchSize) {
      const batchValues = values.slice(i, i + batchSize);
      const batchRules = rules.slice(i, i + batchSize);
      const batchContexts = contexts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batchValues.map((value, j) => {
          // Add null check for batchRules[j]
          const rule = batchRules[j];
          if (!rule) {
            return {
              passed: false,
              message: 'No validation rule provided'
            };
          }
          
          // Add null check for batchContexts[j]
          const context = batchContexts[j];
          if (!context) {
            return {
              passed: false,
              message: 'No validation context provided'
            };
          }
          
          return this.validateSingle(value, rule, context);
        })
      );
      results.push(...batchResults);
    }

    return results;
  }

  private static async validateSingle(
    value: any,
    rule: RuleDefinition,
    context: ValidationContext
  ): Promise<RuleResult> {
    try {
      const result = await this.ruleEngine.validateValue(value, rule, context);
      if (!result.passed && !result.message) {
        let ruleName = 'unknown';
        if (typeof rule === 'string') {
          // Add null check for split result
          const parts = rule.split(':');
          ruleName = parts[0] || 'unknown';
        } else if (Array.isArray(rule)) {
          ruleName = 'array_rule';
        } else if ('_type' in rule) {
          ruleName = rule._type === 'fluent' ? rule._dataType : 'union';
        }
        result.message = this.messageResolver.resolve({
          ...context,
          rule: ruleName,
          value,
          parameters: context.parameters || []
        });
      }
      return result;
    } catch (error) {
      return {
        passed: false,
        message: this.messageResolver.resolve({ ...context, rule: 'validation_failed', value, parameters: context.parameters || [] }) || `Validation failed: ${(error as Error).message}`
      };
    }
  }

  // Add worker pool support for true parallelism in Node.js
  static async validateWithWorkers(
    values: any[],
    rules: RuleDefinition[],
    contexts: ValidationContext[],
    workerCount = 4
  ): Promise<RuleResult[]> {
    // This is a simplified implementation - in a real implementation,
    // you would use Worker threads in Node.js or Web Workers in the browser
    const chunkSize = Math.ceil(values.length / workerCount);
    const chunks: Array<{values: any[], rules: RuleDefinition[], contexts: ValidationContext[]}> = [];
    
    for (let i = 0; i < values.length; i += chunkSize) {
      chunks.push({
        values: values.slice(i, i + chunkSize),
        rules: rules.slice(i, i + chunkSize),
        contexts: contexts.slice(i, i + chunkSize)
      });
    }
    
    const results = await Promise.all(
      chunks.map(chunk => this.validateBatch(chunk.values, chunk.rules, chunk.contexts))
    );
    
    return results.flat();
  }
  
  // Add support for validation with abort controller
  static async validateWithTimeout(
    value: any,
    rule: RuleDefinition,
    context: ValidationContext,
    timeoutMs = 5000
  ): Promise<RuleResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const validationPromise = this.validateSingle(value, rule, context);
      const result = await Promise.race([
        validationPromise,
        new Promise<RuleResult>((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Validation timed out'));
          });
        })
      ]);
      
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        passed: false,
        message: `Validation failed: ${(error as Error).message}`
      };
    }
  }
}