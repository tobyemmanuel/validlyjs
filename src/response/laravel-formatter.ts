import { ResponseFormatter } from './index';
import { LaravelResponse, ValidationError } from '../types';

export class LaravelFormatter implements ResponseFormatter<LaravelResponse> {
  formatType = 'laravel' as const;

  format(errors: ValidationError[]): LaravelResponse {
    const result: LaravelResponse = {};

    for (const error of errors) {
      if (!(error.field in result)) {
        result[error.field] = [];
      }
      (result[error.field] as string[]).push(error.message);
    }

    return result;
  }
}