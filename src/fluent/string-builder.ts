import { StringFluentRule } from '../types';
import { BaseFluentBuilder } from './base-builder';

export class StringBuilder extends BaseFluentBuilder implements StringFluentRule {
    constructor() {
        super('string');
    }

    min(length: number): this {
        return this.addRegistryRule('string.min', [length]);
    }

    max(length: number): this {
        return this.addRegistryRule('string.max', [length]);
    }

    length(length: number): this {
        return this.addRegistryRule('string.length', [length]);
    }

    email(): this {
        return this.addRegistryRule('string.email');
    }

    url(): this {
        return this.addRegistryRule('string.url');
    }

    regex(pattern: RegExp | string): this {
        return this.addRegistryRule('string.regex', [pattern]);
    }

    alpha(): this {
        return this.addRegistryRule('string.alpha');
    }

    alphaNum(): this {
        return this.addRegistryRule('string.alpha_num');
    }

    alphaNumDash(): this {
        return this.addRegistryRule('string.alpha_dash');
    }

    uuid(): this {
        return this.addRegistryRule('string.uuid');
    }

    json(): this {
        return this.addRegistryRule('string.json');
    }

    startsWith(prefix: string): this {
        return this.addRegistryRule('string.starts_with', [prefix]);
    }

    endsWith(suffix: string): this {
        return this.addRegistryRule('string.ends_with', [suffix]);
    }

    contains(substring: string): this {
        return this.addRegistryRule('string.contains', [substring]);
    }

    in(values: string[]): this {
        return this.addRegistryRule('string.in', values);
    }

    notIn(values: string[]): this {
        return this.addRegistryRule('string.not_in', values);
    }
}