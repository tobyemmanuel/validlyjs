import { Rule } from "../types/interfaces.js";

export class BooleanBuilder {
  private rules: Rule[] = [];

  accepted(): this {
    this.rules.push({ name: "accepted", params: [] });
    return this;
  }

  build(): Rule[] {
    return [{ name: "boolean", params: [] }, ...this.rules];
  }
}

export function boolean() {
  return new BooleanBuilder();
}
