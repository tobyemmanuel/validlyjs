import { ResponseFormatter } from './index';
import { GroupedResponse, ValidationError } from '../types';

export class GroupedFormatter implements ResponseFormatter<GroupedResponse> {
  formatType = 'grouped' as const;

  format(errors: ValidationError[]): GroupedResponse {
    const result: GroupedResponse = {};

    for (const error of errors) {
      const segments = error.field.split('.');
      const groupKey: string = segments.length > 1 && segments[0] ? segments[0] : '_root';
      const fieldKey: string = segments.length > 1 ? segments.slice(1).join('.') : error.field;

      // Initialize group if it doesn't exist
      if (!result[groupKey]) {
        result[groupKey] = {} as { [field: string]: string[] };
      }

      // Initialize field array if it doesn't exist
      if (!result[groupKey]![fieldKey]) {
        result[groupKey]![fieldKey] = [];
      }

      result[groupKey]![fieldKey]!.push(error.message);
    }

    return result;
  }
}