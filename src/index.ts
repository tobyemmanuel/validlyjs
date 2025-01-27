export { Validator } from "./core/Validator.js";
export { configure } from "./config.js";
export { string } from "./builders/StringBuilder.js";
export { number } from "./builders/NumberBuilder.js";
export { array } from "./builders/ArrayBuilder.js";
export { file } from "./builders/FileBuilder.js";
export { boolean } from "./builders/BooleanBuilder.js";
export { date } from "./builders/DateBuilder.js";
export { object } from "./builders/ObjectBuilder.js";
export { extend } from './rules/index.js';

// Framework integrations to work on later
// export { useValidator } from "./resolvers/react/useValidator.js";
// export { useValidator as useVueValidator } from './resolvers/vue/useValidator';

export type {
  ValidationResult,
  ValidationConfig,
  SchemaDefinition,
  RuleHandler,
} from "./types/interfaces.js";
