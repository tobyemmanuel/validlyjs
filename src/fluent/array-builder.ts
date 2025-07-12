import { ArrayFluentRule, RuleDefinition } from '../types';
import { BaseFluentBuilder } from './base-builder';

export class ArrayBuilder extends BaseFluentBuilder implements ArrayFluentRule {
    constructor() {
        super('array');
    }

    min(length: number): this {
        return this.addRegistryRule('array.min', [length]);
    }

    max(length: number): this {
        return this.addRegistryRule('array.max', [length]);
    }

    length(length: number): this {
        return this.addRegistryRule('array.length', [length]);
    }

    each(rule: RuleDefinition): this {
        return this.addRegistryRule('array.each', [rule]);
    }

    unique(): this {
        return this.addRegistryRule('array.unique');
    }

    contains(value: any): this {
        return this.addRegistryRule('array.contains', [value]);
    }

    // at(index: number, rule: RuleDefinition): this {
    //     return this.addRegistryRule('array.at', [index, rule]);
    // }
}