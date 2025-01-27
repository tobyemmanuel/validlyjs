import { Rule, RuleDefinition } from "../types/interfaces.js";
import { parseStringRules } from "./StringParser.js";
import { parseFluentRules } from "./FluentParser.js";

export function parseArrayRules(ruleDefinitions: any[]): Rule[] {
  const rules: Rule[] = [];

  for (const definition of ruleDefinitions) {
    if (typeof definition === "string") {
      rules.push(...parseStringRules(definition));
    } else if (Array.isArray(definition)) {
      if (definition.length === 0) continue;
      const [name, ...params] = definition;
      rules.push({
        name: name.toString(),
        params: params.map((p) => p.toString()),
      });
    } else if (typeof definition === "object" && "build" in definition) {
      rules.push(...parseFluentRules(definition));
    } else if (isRule(definition)) {
      rules.push(definition);
    } else {
      throw new Error(`Invalid rule definition: ${JSON.stringify(definition)}`);
    }
  }
  return rules;
}

export function parseNestedArrayRules(ruleDefinitions: RuleDefinition): Rule[] {
  if (typeof ruleDefinitions === "string") {
    return parseStringRules(ruleDefinitions);
  }
  if (Array.isArray(ruleDefinitions)) {
    return parseArrayRules(ruleDefinitions);
  }
  if (typeof ruleDefinitions === "object" && "build" in ruleDefinitions) {
    return parseFluentRules(ruleDefinitions);
  }
  if (isRule(ruleDefinitions)) {
    return [ruleDefinitions];
  }
  throw new Error(`Invalid rule definition format: ${typeof ruleDefinitions}`);
}

function isRule(obj: any): obj is Rule {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "name" in obj &&
    "params" in obj &&
    typeof obj.name === "string" &&
    Array.isArray(obj.params)
  );
}
