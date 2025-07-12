import { Request, Response, NextFunction } from 'express';
import { Validator, RuleDefinition, ValidatorOptions } from 'validlyjs';

export interface ExpressValidationOptions extends ValidatorOptions {
  sources?: ('body' | 'query' | 'params' | 'headers')[];
  errorStatus?: number;
  errorFormat?: 'laravel' | 'flat' | 'grouped' | 'nested';
  onError?: (errors: any, req: Request, res: Response) => void;
}

export class ExpressValidator {
  private options: ExpressValidationOptions;

  constructor(options: ExpressValidationOptions = {}) {
    this.options = {
      sources: ['body', 'query', 'params'],
      errorStatus: 422,
      errorFormat: 'laravel',
      ...options,
    };
  }

  validate(
    rules: Record<string, RuleDefinition>,
    options?: Partial<ExpressValidationOptions>
  ) {
    const mergedOptions = { ...this.options, ...options };

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Combine data from specified sources
        const data: Record<string, any> = {};

        if (mergedOptions.sources?.includes('body')) {
          Object.assign(data, req.body);
        }
        if (mergedOptions.sources?.includes('query')) {
          Object.assign(data, req.query);
        }
        if (mergedOptions.sources?.includes('params')) {
          Object.assign(data, req.params);
        }
        if (mergedOptions.sources?.includes('headers')) {
          Object.assign(data, req.headers);
        }

        const validator = new Validator(rules, mergedOptions);
        const result = await validator.validate(data);
        if (result.isValid) {
          // Attach validated data to request
          req.validatedData = result.data;
          next();
        } else {
          // Handle validation errors
          if (mergedOptions.onError) {
            mergedOptions.onError(result.errors, req, res);
          } else {
            res.status(mergedOptions.errorStatus || 422).json({
              message: 'Validation failed',
              errors: result.errors,
            });
          }
        }
      } catch (error) {
        next(error);
      }
    };
  }

  // Convenience method for body validation
  body(
    rules: Record<string, RuleDefinition>,
    options?: Partial<ExpressValidationOptions>
  ) {
    return this.validate(rules, { ...options, sources: ['body'] });
  }

  // Convenience method for query validation
  query(
    rules: Record<string, RuleDefinition>,
    options?: Partial<ExpressValidationOptions>
  ) {
    return this.validate(rules, { ...options, sources: ['query'] });
  }

  // Convenience method for params validation
  params(
    rules: Record<string, RuleDefinition>,
    options?: Partial<ExpressValidationOptions>
  ) {
    return this.validate(rules, { ...options, sources: ['params'] });
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
    }
  }
}
