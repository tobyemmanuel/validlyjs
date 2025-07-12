export * from './rules';
export * from './validators';
export * from './parsers';
export * from './messages';
export * from './config';

// Common utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Update ValidationContext type to include path
export type ValidationContext = {
  field: string;
  data: Record<string, any>;
  parentPath?: string;
  path?: string;
  index?: number;
  parameters?: any[];
};

export type AsyncValidationResult = Promise<ValidationResult>;

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: any;
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  value: any;
  parameters: any[];
}

export interface ResponseFormatter<T = any> {
  format(errors: ValidationError[], data: Record<string, any>): T;
  formatType: ResponseType;
}
