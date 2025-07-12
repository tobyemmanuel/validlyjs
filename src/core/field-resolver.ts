import { ValidationSchema, RuleDefinition } from '../types';

export class FieldResolver {
  // Cache for compiled path segments and array index regex
  private readonly pathSegmentCache = new Map<string, string[]>();
  private readonly arrayIndexRegex = /^([^\[]+)\[(\d+)\]$/;
  private readonly pathEndArrayRegex = /\[(\d+)\]$/;
  private readonly optionalRuleCache = new Map<RuleDefinition, boolean>();

  resolveFields(schema: ValidationSchema, data: Record<string, any>): Map<string, any> {
    const fields = new Map<string, any>();
    this.resolveFieldsRecursive(schema, data, '', fields);
    return fields;
  }

  private resolveFieldsRecursive(
    schema: ValidationSchema,
    data: Record<string, any>,
    parentPath: string,
    fields: Map<string, any>
  ): void {
    const entries = Object.entries(schema);
    
    for (let i = 0; i < entries.length; i++) {
      const [key, rules] = entries[i] as [string, RuleDefinition];
      const isWildcard = key.includes('*');
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      
      if (isWildcard) {
        this.resolveWildcardPath(currentPath, data, rules, fields);
      } else {
        const value = this.resolvePath(data, currentPath);
        
        // Check if field is missing and optional/nullable
        if (value === undefined && this.isOptionalField(rules)) {
          continue;
        }
        
        fields.set(currentPath, value);

        // Optimize array handling
        if (Array.isArray(value)) {
          for (let j = 0; j < value.length; j++) {
            fields.set(`${currentPath}[${j}]`, value[j]);
          }
        }
      }
    }
  }

  private isOptionalField(rules: RuleDefinition): boolean {
    // Check cache first
    const cached = this.optionalRuleCache.get(rules);
    if (cached !== undefined) {
      return cached;
    }

    let result = false;

    // Handle string rules (most common case) - optimized
    if (typeof rules === 'string') {
      // Use indexOf for better performance than split + includes
      result = rules.indexOf('optional') !== -1 || rules.indexOf('nullable') !== -1;
    }
    // Handle array rules
    else if (Array.isArray(rules)) {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (typeof rule === 'string' && 
            (rule === 'optional' || rule === 'nullable' || 
             rule.indexOf('optional') !== -1 || rule.indexOf('nullable') !== -1)) {
          result = true;
          break;
        }
      }
    }
    // Handle FluentRule
    else if (typeof rules === 'object' && rules !== null && '_type' in rules && rules._type === 'fluent') {
      const modifiers = rules._modifiers;
      if (modifiers) {
        for (let i = 0; i < modifiers.length; i++) {
          const modifier = modifiers[i];
          if (modifier?.type === 'optional' || modifier?.type === 'nullable') {
            result = true;
            break;
          }
        }
      }
    }
    // Handle UnionRule
    else if (typeof rules === 'object' && rules !== null && '_type' in rules && rules._type === 'union') {
      result = false;
    }

    // Cache the result
    this.optionalRuleCache.set(rules, result);
    return result;
  }

  private resolveWildcardPath(
    path: string,
    data: Record<string, any>,
    _rules: any,
    fields: Map<string, any>
  ): void {
    // Use cached path segments for better performance
    const segments = this.getPathSegments(path);
    let wildcardIndex = -1;
    
    // Find wildcard index more efficiently
    for (let i = 0; i < segments.length; i++) {
      if (segments[i] === '*') {
        wildcardIndex = i;
        break;
      }
    }
    
    if (wildcardIndex === -1) return;

    const prefix = segments.slice(0, wildcardIndex).join('.');
    const suffix = segments.slice(wildcardIndex + 1).join('.');
    const parentValue = prefix ? this.resolvePath(data, prefix) : data;

    if (Array.isArray(parentValue)) {
      const length = parentValue.length;
      for (let index = 0; index < length; index++) {
        const resolvedPath = suffix ? `${prefix}[${index}].${suffix}` : `${prefix}[${index}]`;
        const value = this.resolvePath(data, resolvedPath);
        fields.set(resolvedPath, value);
      }
    } else if (typeof parentValue === 'object' && parentValue !== null) {
      const keys = Object.keys(parentValue);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const resolvedPath = suffix ? `${prefix}.${key}.${suffix}` : `${prefix}.${key}`;
        const value = this.resolvePath(data, resolvedPath);
        fields.set(resolvedPath, value);
      }
    }
  }

  private getPathSegments(path: string): string[] {
    // Use cache to avoid repeated splitting
    const cached = this.pathSegmentCache.get(path);
    if (cached) {
      return cached;
    }

    const segments = path.split('.');
    this.pathSegmentCache.set(path, segments);
    return segments;
  }

  resolvePath(data: Record<string, any>, path: string): any {
    try {
      const segments = this.getPathSegments(path);
      let current = data;
      
      for (let i = 0; i < segments.length; i++) {
        if (current === undefined) return undefined;
        
        const key = segments[i] as string;
        const match = this.arrayIndexRegex.exec(key);
        
        if (match) {
          const arrayKey = match[1];
          const indexStr = match[2];
          
          if (arrayKey && indexStr) {
            const array = current[arrayKey];
            if (!Array.isArray(array)) return undefined;
            
            const index = parseInt(indexStr, 10);
            current = array[index];
          } else {
            return undefined;
          }
        } else {
          current = current[key];
        }
      }
      
      return current;
    } catch {
      return undefined;
    }
  }

  getParentPath(path: string): string | undefined {
    const lastDotIndex = path.lastIndexOf('.');
    return lastDotIndex > -1 ? path.substring(0, lastDotIndex) : undefined;
  }

  getArrayIndex(path: string): number | undefined {
    const match = this.pathEndArrayRegex.exec(path);
    return match && match[1] ? parseInt(match[1], 10) : undefined;
  }

  // Method to clear caches when needed (useful for memory management)
  clearCache(): void {
    this.pathSegmentCache.clear();
    this.optionalRuleCache.clear();
  }

  // Method to get cache statistics (useful for debugging/monitoring)
  getCacheStats(): { pathSegments: number; optionalRules: number } {
    return {
      pathSegments: this.pathSegmentCache.size,
      optionalRules: this.optionalRuleCache.size,
    };
  }
}