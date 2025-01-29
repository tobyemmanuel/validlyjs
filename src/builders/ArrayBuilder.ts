import { Rule } from "../types/interfaces.js";

export class ArrayBuilder {
  private rules: Rule[] = [];

  each(ruleDef: any): this {
    this.rules.push({ name: "each", params: [JSON.stringify(ruleDef)] });
    return this;
  }

  min(length: number): this {
    this.rules.push({ name: "min", params: [length.toString()] });
    return this;
  }

  custom(ruleName: string, ...params: any[]): this {
    this.rules.push({ name: ruleName, params: params.map(String) });
    return this;
  }

  build(): Rule[] {
    return [{ name: "array", params: [] }, ...this.rules];
  }
}

export function array() {
  return new ArrayBuilder();
}
