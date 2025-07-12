import { DateFluentRule } from '../types';
import { BaseFluentBuilder } from './base-builder';

export class DateBuilder extends BaseFluentBuilder implements DateFluentRule {
    constructor() {
        super('date');
    }

    after(date: string | Date): this {
        this.addRegistryRule('date.after', [date]);
        return this;
    }

    before(date: string | Date): this {
        this.addRegistryRule('date.before', [date]);
        return this;
    }

    afterOrEqual(date: string | Date): this {
        this.addRegistryRule('date.after_or_equal', [date]);
        return this;
    }

    beforeOrEqual(date: string | Date): this {
        this.addRegistryRule('date.before_or_equal', [date]);
        return this;
    }

    format(format: string): this {
        this.addRegistryRule('date.format', [format]);
        return this;
    }

    timezone(timezone: string): this {
        this.addRegistryRule('date.timezone', [timezone]);
        return this;
    }

    weekday(): this {
        this.addRegistryRule('date.weekday');
        return this;
    }

    weekend(): this {
        this.addRegistryRule('date.weekend');
        return this;
    }
}