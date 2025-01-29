import { Rule } from "../types/interfaces.js";

export class BooleanBuilder {
  private rules: Rule[] = [];

  accepted(): this {
    this.rules.push({ name: "accepted", params: [] });
    return this;
  }

  custom(ruleName: string, ...params: any[]): this {
    this.rules.push({ name: ruleName, params: params.map(String) });
    return this;
  }
  
  build(): Rule[] {
    return [{ name: "boolean", params: [] }, ...this.rules];
  }
}

export function boolean() {
  return new BooleanBuilder();
}
