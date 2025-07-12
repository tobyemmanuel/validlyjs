import { NumberFluentRule } from '../types';
import { BaseFluentBuilder } from './base-builder';

export class NumberBuilder extends BaseFluentBuilder implements NumberFluentRule {
    constructor() {
        super('number');
    }

    min(minValue: number): this {
        return this.addRegistryRule('number.min', [minValue]);
    }

    max(maxValue: number): this {
        return this.addRegistryRule('number.max', [maxValue]);
    }

    between(min: number, max: number): this {
        return this.addRegistryRule('number.between', [min, max]);
    }

    positive(): this {
        return this.addRegistryRule('number.positive');
    }

    negative(): this {
        return this.addRegistryRule('number.negative');
    }

    integer(): this {
        return this.addRegistryRule('number.integer');
    }

    decimal(places?: number): this {
        return this.addRegistryRule('number.decimal', places !== undefined ? [places] : []);
    }

    multipleOf(divisor: number): this {
        return this.addRegistryRule('number.multiple_of', [divisor]);
    }
}
