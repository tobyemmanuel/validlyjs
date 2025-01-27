import { Rule } from "../types/interfaces.js";
import { StringBuilder } from "../builders/StringBuilder.js";
export function parseFluentRules(builder: any): Rule[] {
  const rules: Rule[] = [];

  if (builder instanceof StringBuilder) {
    rules.push({ name: "string", params: [] });
  }
  builder.rules.forEach((rule: any) => {
    rules.push({
      name: rule.name,
      params: rule.params.map(String),
    });
  });
  return rules;
}
