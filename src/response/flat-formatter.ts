import { ResponseFormatter } from './index';
import { FlatResponse, ValidationError } from '../types';

export class FlatFormatter implements ResponseFormatter<FlatResponse> {
  formatType = 'flat' as const;

  format(errors: ValidationError[]): FlatResponse {
    const result: FlatResponse = {};

    for (const error of errors) {
      // Take the first error message for each field
      if (!result[error.field]) {
        result[error.field] = error.message;
      }
    }

    return result;
  }
}