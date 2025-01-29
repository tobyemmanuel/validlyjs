import { Rule } from "../types/interfaces.js";
import { StringBuilder } from "../builders/StringBuilder.js";
export function parseFluentRules(builder: any): Rule[] {
  const rules: Rule[] = [];

  builder.rules.forEach((rule: any) => {
    if (rule.name === "custom") {
      rules.push({
        name: "custom",
        params: [rule.params[0]],
        custom: true,
      });
    } else {
      rules.push({
        name: rule.name,
        params: rule.params.map(String),
        custom: false,
      });
    }
  });
  return rules;
}
