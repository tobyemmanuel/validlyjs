import { Rule } from "../types/interfaces.js";

export class FileBuilder {
  private rules: Rule[] = [];

  maxSize(size: string): this {
    this.rules.push({ name: "maxSize", params: [size] });
    return this;
  }

  mimes(types: string[]): this {
    this.rules.push({ name: "mimes", params: types });
    return this;
  }

  dimensions(constraints: string): this {
    this.rules.push({ name: "dimensions", params: [constraints] });
    return this;
  }

  build(): Rule[] {
    return [{ name: "file", params: [] }, ...this.rules];
  }
}

export function file() {
  return new FileBuilder();
}
