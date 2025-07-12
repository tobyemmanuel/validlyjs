import { ResponseFormatter } from './index.js';
import { NestedResponse, ValidationError } from '../types';

export class NestedFormatter implements ResponseFormatter<NestedResponse> {
  formatType = 'nested' as const;

  format(errors: ValidationError[]): NestedResponse {
    const result: NestedResponse = {};

    for (const error of errors) {
      this.setNestedValue(result, error.field, error.rule, error.message);
    }

    return result;
  }

  private setNestedValue(obj: any, path: string, rule: string, message: string): void {
    const segments = path.split('.');
    let current = obj;

    // Navigate to the target location
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;

      if (segment) {
        if (isLast) {
          // At the final segment, create the rule object if it doesn't exist
          if (!(segment in current)) {
            current[segment] = {};
          }
          // Set the rule name as key with the message as value
          current[segment][rule] = message;
        } else {
          // Create intermediate objects
          if (!(segment in current)) {
            current[segment] = {};
          }
          current = current[segment];
        }
      }
    }
  }
}