import { Rule } from "../types/interfaces.js";

export class StringBuilder {
  protected  rules: Rule[] = [];

  [key: string]: any;

  constructor() {
    this.rules.push({ name: "string", params: [] });
  }

  required(): this {
    this.rules.push({ name: "required", params: [] });
    return this;
  }

  min(length: number): this {
    this.rules.push({ name: "min", params: [length.toString()] });
    return this;
  }

  max(length: number): this {
    this.rules.push({ name: "max", params: [length.toString()] });
    return this;
  }

  email(): this {
    this.rules.push({ name: "email", params: [] });
    return this;
  }

  addRule(name: string): this {
    this.rules.push({ name, params: [] });
    return this;
  }

  build(): Rule[] {
    return this.rules;
  }
}

export function string() {
  return new StringBuilder();
}
