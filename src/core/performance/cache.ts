import { RuleDefinition, CompiledRule, RuleResult } from "../../types";

// Add statistics tracking for cache performance monitoring
export class CacheStats {
  hits = 0;
  misses = 0;
  evictions = 0;
  
  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }
  
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }
}

// Enhance ValidationCache with stats
export class ValidationCache {
  private cache = new Map<string, RuleResult>();
  private maxSize = 1000;
  public stats = new CacheStats();
  
  set(key: string, result: RuleResult): void {
    if (this.cache.has(key)) {
      // Move to most-recent (Map preserves insertion order).
      this.cache.delete(key);
      this.cache.set(key, result);
      return;
    }
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
        this.stats.evictions++;
      }
    }
    this.cache.set(key, result);
  }

  get(key: string): RuleResult | undefined {
    const result = this.cache.get(key);
    if (result) {
      this.stats.hits++;
      // Refresh recency (LRU).
      this.cache.delete(key);
      this.cache.set(key, result);
    } else {
      this.stats.misses++;
    }
    return result;
  }
  
  clear(): void {
    this.cache.clear();
  }

  generateKey(rule: RuleDefinition): string {
    if (!rule) throw new Error("Invalid rule definition");
    if (typeof rule === "string") return rule;
    if (Array.isArray(rule)) {
      return rule.map((r) => this.generateKey(r)).join("|");
    }
    if (rule._type === "fluent") {
      return `${rule._dataType}:${rule._rules.map((r) => r.name).join("|")}`;
    }
    throw new Error("Unsupported rule type");
  }
}

export class CompiledRuleCache {
  private cache = new Map<string, CompiledRule[]>();
  private maxSize = 1000;

  set(key: string, rules: CompiledRule[]): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.cache.set(key, rules);
      return;
    }
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }
    this.cache.set(key, rules);
  }

  get(key: string): CompiledRule[] | undefined {
    const rules = this.cache.get(key);
    if (rules) {
      this.cache.delete(key);
      this.cache.set(key, rules);
    }
    return rules;
  }

  clear(): void {
    this.cache.clear();
  }

  generateKey(rule: RuleDefinition): string {
    if (!rule) throw new Error("Invalid rule definition");
    if (typeof rule === "string") return rule;
    if (Array.isArray(rule)) {
      return rule.map((r) => this.generateKey(r)).join("|");
    }
    if (rule._type === "fluent") {
      return `${rule._dataType}:${rule._rules.map((r) => r.name).join("|")}`;
    }
    throw new Error("Unsupported rule type");
  }
}
