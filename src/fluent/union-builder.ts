import { ValidationContext, RuleDefinition } from '../types';
import { BaseFluentBuilder } from './base-builder';

export class UnionBuilder extends BaseFluentBuilder {
    private rules: RuleDefinition[] = [];

    constructor() {
        super('union');
    }

    add(rule: RuleDefinition): this {
        this.rules.push(rule);
        return this;
    }

    stopOnFirstPass(enabled: boolean = true): this {
        this._rules.push({
            name: 'union.stopOnFirstPass',
            validator: (_value: any, _context: ValidationContext) => ({
                passed: true // This is a configuration rule, actual validation happens in rule engine
            }),
            async: false,
            parameters: [enabled]
        });
        return this;
    }
}