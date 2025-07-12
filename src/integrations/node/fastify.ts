import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyPluginOptions,
} from 'fastify';
import fp from 'fastify-plugin';
import { Validator, RuleDefinition, ValidatorOptions } from 'validlyjs';

export interface FastifyValidationOptions extends ValidatorOptions {
  sources?: ('body' | 'query' | 'params' | 'headers')[];
  errorStatus?: number;
  errorFormat?: 'laravel' | 'flat' | 'grouped' | 'nested';
  onError?: (errors: any, request: FastifyRequest, reply: FastifyReply) => void;
}

export class FastifyValidator {
  private options: FastifyValidationOptions;

  constructor(options: FastifyValidationOptions = {}) {
    this.options = {
      sources: ['body', 'query', 'params'],
      errorStatus: 422,
      errorFormat: 'laravel',
      ...options,
    };
  }

  validate(
    rules: Record<string, RuleDefinition>,
    options?: Partial<FastifyValidationOptions>
  ) {
    const mergedOptions = { ...this.options, ...options };

    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Combine data from specified sources
        const data: Record<string, any> = {};

        if (mergedOptions.sources?.includes('body')) {
          Object.assign(data, request.body);
        }
        if (mergedOptions.sources?.includes('query')) {
          Object.assign(data, request.query);
        }
        if (mergedOptions.sources?.includes('params')) {
          Object.assign(data, request.params);
        }
        if (mergedOptions.sources?.includes('headers')) {
          Object.assign(data, request.headers);
        }

        const validator = new Validator(rules, mergedOptions);
        const result = await validator.validate(data);

        if (result.isValid) {
          // Attach validated data to request
          (request as any).validatedData = result.data;
        } else {
          // Handle validation errors
          if (mergedOptions.onError) {
            mergedOptions.onError(result.errors, request, reply);
            return;
          } else {
            return reply.code(mergedOptions.errorStatus || 422).send({
              message: 'Validation failed',
              errors: result.errors,
            });
          }
        }
      } catch (error) {
        throw error;
      }
    };
  }

  // Convenience method for body validation
  body(
    rules: Record<string, RuleDefinition>,
    options?: Partial<FastifyValidationOptions>
  ) {
    return this.validate(rules, { ...options, sources: ['body'] });
  }

  // Convenience method for query validation
  query(
    rules: Record<string, RuleDefinition>,
    options?: Partial<FastifyValidationOptions>
  ) {
    return this.validate(rules, { ...options, sources: ['query'] });
  }

  // Convenience method for params validation
  params(
    rules: Record<string, RuleDefinition>,
    options?: Partial<FastifyValidationOptions>
  ) {
    return this.validate(rules, { ...options, sources: ['params'] });
  }
}

// Fastify plugin
async function validlyPluginFunction(
  fastify: FastifyInstance,
  options: FastifyValidationOptions & FastifyPluginOptions
) {
  const validator = new FastifyValidator(options);

  fastify.decorate('validate', validator.validate.bind(validator));
  fastify.decorate('validateBody', validator.body.bind(validator));
  fastify.decorate('validateQuery', validator.query.bind(validator));
  fastify.decorate('validateParams', validator.params.bind(validator));
}

// Export the plugin wrapped with fastify-plugin
export const validlyPlugin = fp(validlyPluginFunction, {
  fastify: '5.x',
  name: 'validly-plugin',
});

// Extend Fastify instance interface
declare module 'fastify' {
  interface FastifyInstance {
    validate: (
      rules: Record<string, RuleDefinition>,
      options?: Partial<FastifyValidationOptions>
    ) => any;
    validateBody: (
      rules: Record<string, RuleDefinition>,
      options?: Partial<FastifyValidationOptions>
    ) => any;
    validateQuery: (
      rules: Record<string, RuleDefinition>,
      options?: Partial<FastifyValidationOptions>
    ) => any;
    validateParams: (
      rules: Record<string, RuleDefinition>,
      options?: Partial<FastifyValidationOptions>
    ) => any;
  }
}
