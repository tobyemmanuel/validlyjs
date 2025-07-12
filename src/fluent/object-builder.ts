import { ObjectFluentRule, RuleDefinition } from '../types';
import { BaseFluentBuilder } from './base-builder';

export class ObjectBuilder extends BaseFluentBuilder implements ObjectFluentRule {
    constructor() {
        super('object');
    }

    shape(schema: Record<string, RuleDefinition>): this {
        this.addRegistryRule('object.shape', [schema]);
        return this;
    }

    keys(keys: string[]): this {
        this.addRegistryRule('object.keys', [keys]);
        return this;
    }

    strict(): this {
        this.addRegistryRule('object.strict');
        return this;
    }
}