import { Rule, RuleDefinition } from "./interfaces.js";

export type InferTypeFromRules<T> = {
  [K in keyof T]: T[K] extends RuleDefinition ? InferRuleType<T[K]> : never;
};

export type RuleParams<T extends Rule> = T["params"];

type InferRuleType<R extends RuleDefinition> = R extends { nullable: true }
  ? InferBasicType<R> | null
  : R extends { required: false }
  ? InferBasicType<R> | undefined
  : InferBasicType<R>;

type InferBasicType<R> = R extends { type: "string" }
  ? string
  : R extends { type: "number" }
  ? number
  : R extends { type: "boolean" }
  ? boolean
  : R extends { type: "file" }
  ? File
  : any;
