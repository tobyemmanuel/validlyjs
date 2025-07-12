// Export Express integration
export { ExpressValidator } from './express';
export type { ExpressValidationOptions } from './express';

// Export Fastify integration
export { FastifyValidator, validlyPlugin } from './fastify';
export type { FastifyValidationOptions } from './fastify';

// General Node.js validator
// import { Validator, ValidatorOptions } from '../../index';

// export class NodeValidator extends Validator {
//   constructor(rules: Record<string, any> = {}, options: ValidatorOptions = {}) {
//     super(rules, options);
//   }

//   // Add Node.js specific methods here if needed
//   async validateFile(_filePath: string, _rules: any) {
//     // Implementation for file validation
//     // This would use Node.js fs module
//     throw new Error('File validation not implemented yet');
//   }
// }

// Re-export core types for convenience
// export type {
//   ValidationResult,
//   ValidationError,
//   RuleDefinition,
//   ValidatorOptions,
// } from '../../types';
