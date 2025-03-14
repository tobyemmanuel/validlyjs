import { Rule } from "../types/interfaces.js";

export class ObjectBuilder {
  private rules: Rule[] = [];

  shape(schema: any): this {
    this.rules.push({ name: "shape", params: [JSON.stringify(schema)] });
    return this;
  }

  strict(): this {
    this.rules.push({ name: "strict", params: [] });
    return this;
  }

  custom(ruleName: string, ...params: any[]): this {
    this.rules.push({ name: ruleName, params: params.map(String) });
    return this;
  }

  build(): Rule[] {
    return [{ name: "object", params: [] }, ...this.rules];
  }
}

export function object() {
  return new ObjectBuilder();
}
