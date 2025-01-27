import { Rule } from "../types/interfaces.js";

export class NumberBuilder {
  private rules: Rule[] = [];

  min(n: number): this {
    this.rules.push({ name: "min", params: [n.toString()] });
    return this;
  }

  digits(length: number): this {
    this.rules.push({ name: "digits", params: [length.toString()] });
    return this;
  }

  build(): Rule[] {
    return [{ name: "number", params: [] }, ...this.rules];
  }
}

export function number() {
  return new NumberBuilder();
}
