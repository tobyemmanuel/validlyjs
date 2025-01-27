import { parseStringRules } from "./StringParser.js";
import { parseArrayRules } from "./ArrayParser.js";
import { parseFluentRules } from "./FluentParser.js";
import { Rule } from "../types/interfaces.js";

export function parseRules(ruleDef: any): Rule[] {
  if (typeof ruleDef === "string") {
    return parseStringRules(ruleDef);
  }
  if (Array.isArray(ruleDef)) {
    return parseArrayRules(ruleDef);
  }
  if (typeof ruleDef === "object" && "build" in ruleDef) {
    return parseFluentRules(ruleDef);
  }
  throw new Error(`Unsupported rule definition format: ${typeof ruleDef}`);
}
