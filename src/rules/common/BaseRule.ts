import { RuleHandler } from '../../types/interfaces.js';

const ruleRegistry = new Map<string, RuleHandler>();

export function registerRule(name: string, handler: RuleHandler) {
  ruleRegistry.set(name, handler);
}