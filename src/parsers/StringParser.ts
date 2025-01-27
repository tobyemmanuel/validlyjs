import { Rule } from "../types/interfaces.js";

const RULE_PATTERN = /([a-z_]+)(?::([^|]+))?/g;

export function parseStringRules(ruleString: string): Rule[] {
  const rules: Rule[] = [];
  let match: RegExpExecArray | null;

  while ((match = RULE_PATTERN.exec(ruleString)) !== null) {
    const [_, name, params] = match;
    rules.push({
      name,
      params: params ? params.split(",") : [],
      custom: false,
    });
  }

  return rules;
}
