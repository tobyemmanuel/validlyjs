import { BooleanFluentRule } from '../types';
import { BaseFluentBuilder } from './base-builder';

export class BooleanBuilder
  extends BaseFluentBuilder
  implements BooleanFluentRule
{
  constructor() {
    super('boolean');
  }

  true(): this {
    this.addRegistryRule('boolean.true');
    return this;
  }

  accepted(): this {
    this.addRegistryRule('boolean.true');
    return this;
  }

  false(): this {
    this.addRegistryRule('boolean.false');
    return this;
  }
}
