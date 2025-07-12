export { LaravelFormatter } from "./laravel-formatter";
export { FlatFormatter } from "./flat-formatter";
export { GroupedFormatter } from "./grouped-formatter";
export { NestedFormatter } from "./nested-formatter";

import { LaravelFormatter } from "./laravel-formatter";
import { FlatFormatter } from "./flat-formatter";
import { GroupedFormatter } from "./grouped-formatter";
import { NestedFormatter } from "./nested-formatter";
import { ResponseType, ValidationError } from "../types";

export interface ResponseFormatter<T = any> {
  format(errors: ValidationError[], data: Record<string, any>): T;
  formatType: ResponseType;
}

export class ResponseFormatterFactory {
  private static formatters = new Map<ResponseType, ResponseFormatter>([
    ["laravel", new LaravelFormatter()],
    ["flat", new FlatFormatter()],
    ["grouped", new GroupedFormatter()],
    ["nested", new NestedFormatter()],
  ]);

  static getFormatter(type: ResponseType): ResponseFormatter {
    const formatter = this.formatters.get(type);
    if (!formatter) {
      throw new Error(`Unknown response format: ${type}`);
    }
    return formatter;
  }

  static registerFormatter(
    type: ResponseType,
    formatter: ResponseFormatter
  ): void {
    this.formatters.set(type, formatter);
  }
}
