export { Validator } from "./core/Validator.js";
export { configure } from "./config.js";
export { string } from "./builders/StringBuilder.js";
export { number } from "./builders/NumberBuilder.js";
export { array } from "./builders/ArrayBuilder.js";
export { file } from "./builders/FileBuilder.js";
export { boolean } from "./builders/BooleanBuilder.js";
export { date } from "./builders/DateBuilder.js";
export { object } from "./builders/ObjectBuilder.js";
export { extend } from "./rules/index.js";

let useValidator = null;
let useVueValidator = null;

try {
  const react = await import("./resolvers/react/index.js");
  useValidator = react.useValidator;
} catch (e) {
  // console.warn("React not installed. React integration disabled.");
}

try {
  const vue = await import("./resolvers/vue/index.js");
  useVueValidator = vue.useValidator;
} catch (e) {
  // console.warn("Vue not installed. Vue integration disabled.");
}

export { useValidator, useVueValidator };

export type {
  ValidationResult,
  ValidationConfig,
  SchemaDefinition,
  RuleHandler,
} from "./types/interfaces.js";
