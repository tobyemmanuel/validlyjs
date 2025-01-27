import { RuleHandler } from "../../types/interfaces.js";
import { requiredRule } from "../common/Required.js";
export const requiredUnlessRule: RuleHandler = {
    validate: (value, [otherField, unexpectedValue], ctx) => {
      return ctx.data[otherField] != unexpectedValue 
        ? requiredRule.validate(value, [], ctx)
        : true;
    },
    message: (params, ctx) => 
      `${ctx.field} is required unless ${params[0]} is ${params[1]}`
  };