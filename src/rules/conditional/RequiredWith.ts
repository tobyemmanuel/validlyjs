import { RuleHandler } from "../../types/interfaces.js";
import { requiredRule } from "../common/Required.js";

export const requiredWithRule: RuleHandler = {
    validate: (value, [fields], ctx) => {
      const anyPresent = fields.split(',').some(f => ctx.data[f] !== undefined);
      return anyPresent ? requiredRule.validate(value, [], ctx) : true;
    },
    message: (params, ctx) => 
      `${ctx.field} is required when ${params[0]} is present`
  };