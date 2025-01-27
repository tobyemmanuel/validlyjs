import { Rule } from "../types/interfaces.js";

export class DateBuilder {
  private rules: Rule[] = [];

  after(date: string | Date): this {
    const dateStr = date instanceof Date ? date.toISOString() : date;
    this.rules.push({ name: "after", params: [dateStr] });
    return this;
  }

  before(date: string | Date): this {
    const dateStr = date instanceof Date ? date.toISOString() : date;
    this.rules.push({ name: "before", params: [dateStr] });
    return this;
  }

  build(): Rule[] {
    return [{ name: "date", params: [] }, ...this.rules];
  }
}

export function date() {
  return new DateBuilder();
}
