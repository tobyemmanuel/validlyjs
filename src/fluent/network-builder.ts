import { BaseFluentBuilder } from './base-builder';

export interface NetworkFluentRule {
    port(): this;
    domain(): this;
}

export class NetworkBuilder extends BaseFluentBuilder implements NetworkFluentRule {
    constructor() {
        super('string'); // Network rules typically validate strings
    }

    port(): this {
        this.addRegistryRule('network.port');
        return this;
    }

    domain(): this {
        this.addRegistryRule('network.domain');
        return this;
    }
}