import { RuleEngine } from './rule-engine';
import { UnionRule, ValidationContext, RuleResult } from '../types';
import { MessageResolver } from '../messages/message-resolver';
import { ParallelValidator } from './performance/parallel';

export class UnionValidator {
  private messageResolver: MessageResolver;

  constructor(
    private ruleEngine: RuleEngine,
    private options: { stopOnFirstPass?:boolean, parallelValidation?: boolean } = {}
  ) {
    this.messageResolver = new MessageResolver({ language: 'en' });
  }

  async validate(value: any, rule: UnionRule, context: ValidationContext): Promise<RuleResult> {
    const results: RuleResult[] = [];

    if (this.options.parallelValidation) {
      const contexts = rule.rules.map(() => ({ ...context }));
      const values = rule.rules.map(() => value);
      results.push(...await ParallelValidator.validateBatch(values, rule.rules, contexts));
    } else {
      for (const subRule of rule.rules) {
        const result = await this.ruleEngine.validateValue(value, subRule, context);
        results.push(result);

        if (result.passed && rule.stopOnFirstPass) {
          return result;
        }
      }
    }

    const passed = results.some(r => r.passed);
    if (passed) return { passed: true };

    const messages = results.map(r => r.message).filter(Boolean);
    const message = this.messageResolver.resolve({
      ...context,
      rule: 'union.failed',
      value,
      parameters: [messages.join(', ')]
    }) || messages.join(' OR ');

    return { passed: false, message };
  }
}