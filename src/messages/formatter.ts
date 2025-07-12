import { MessageContext } from '../types/messages';

interface CompiledTemplate {
  parts: string[];
  placeholders: PlaceholderInfo[];
}

interface PlaceholderInfo {
  index: number;
  type: 'field' | 'rule' | 'value' | 'param' | 'named' | 'custom';
  key?: string | number;
  formatter?: string;
}

export class MessageFormatter {
  private placeholderFormatters: Map<string, (value: any) => string>;
  private templateCache: Map<string, CompiledTemplate> = new Map();
  private fieldNameCache: Map<string, string> = new Map();
  private namedPlaceholderMap: Map<string, string[]>;

  constructor() {
    this.placeholderFormatters = new Map();
    this.namedPlaceholderMap = this.createNamedPlaceholderMap();
    this.setupDefaultFormatters();
  }

  /**
   * Format message template with context - optimized version
   */
  format(template: string, context: MessageContext): string {
    // Get or create compiled template
    let compiled = this.templateCache.get(template);
    if (!compiled) {
      compiled = this.compileTemplate(template);
      this.templateCache.set(template, compiled);
    }

    // Fast path for templates without placeholders
    if (compiled.placeholders.length === 0) {
      return template;
    }

    // Build result string efficiently
    const result: string[] = [];
    let lastIndex = 0;

    for (const placeholder of compiled.placeholders) {
      // Add text before placeholder
      if (placeholder.index > lastIndex) {
        result.push(template.substring(lastIndex, placeholder.index));
      }

      // Resolve and format placeholder value
      const value = this.resolvePlaceholder(placeholder, context);
      result.push(value);

      // Find the end of the placeholder in the original template
      const placeholderEnd = template.indexOf('}', placeholder.index) + 1;
      lastIndex = placeholderEnd;
    }

    // Add remaining text
    if (lastIndex < template.length) {
      result.push(template.substring(lastIndex));
    }

    return result.join('');
  }

  /**
   * Compile template into efficient format
   */
  private compileTemplate(template: string): CompiledTemplate {
    const placeholders: PlaceholderInfo[] = [];
    const placeholderRegex = /{([^}]+)}/g;
    let match: RegExpExecArray | null;

    while ((match = placeholderRegex.exec(template)) !== null) {
      const content = match[1] as string;
      const index = match.index;

      const placeholderInfo = this.parsePlaceholder(content, index);
      if (placeholderInfo) {
        placeholders.push(placeholderInfo);
      }
    }

    return {
      parts: [], // Not used in optimized version
      placeholders,
    };
  }

  /**
   * Parse individual placeholder
   */
  private parsePlaceholder(
    content: string,
    index: number
  ): PlaceholderInfo | null {
    // Basic placeholders
    if (content === 'field') {
      return { index, type: 'field' };
    }
    if (content === 'rule') {
      return { index, type: 'rule' };
    }
    if (content === 'value') {
      return { index, type: 'value' };
    }

    // Numeric parameter placeholders {0}, {1}, etc.
    if (/^\d+$/.test(content)) {
      return {
        index,
        type: 'param',
        key: parseInt(content),
      };
    }

    // Custom formatter placeholders
    if (this.placeholderFormatters.has(content)) {
      return {
        index,
        type: 'custom',
        formatter: content,
      };
    }

    // Named parameter placeholders
    return {
      index,
      type: 'named',
      key: content,
    };
  }

  /**
   * Resolve placeholder value efficiently
   */
  private resolvePlaceholder(
    placeholder: PlaceholderInfo,
    context: MessageContext
  ): string {
    switch (placeholder.type) {
      case 'field':
        return this.getFormattedFieldName(context.field);

      case 'rule':
        return context.rule;

      case 'value':
        return this.formatValue(context.value);

      case 'param':
        const paramIndex = placeholder.key as number;
        if (paramIndex < context.parameters.length) {
          return this.formatValue(context.parameters[paramIndex]);
        }
        return '';

      case 'named':
        const namedValue = this.resolveNamedPlaceholder(
          placeholder.key as string,
          context
        );
        // Special case: don't format the 'formats' placeholder value
        if (placeholder.key === 'formats') {
          return namedValue !== null ? String(namedValue) : '';
        }
        return namedValue !== null ? this.formatValue(namedValue) : '';

      case 'custom':
        const formatter = this.placeholderFormatters.get(
          placeholder.formatter!
        );
        if (formatter) {
          const value = this.getCustomPlaceholderValue(
            placeholder.formatter!,
            context
          );
          return formatter(value);
        }
        return '';

      default:
        return '';
    }
  }

  /**
   * Get formatted field name with caching
   */
  private getFormattedFieldName(field: string): string {
    let formatted = this.fieldNameCache.get(field);
    if (formatted === undefined) {
      formatted = this.formatFieldName(field);
      this.fieldNameCache.set(field, formatted);
    }
    return formatted;
  }

  /**
   * Format field name (convert dot notation to readable format) - optimized
   */
  formatFieldName(field: string): string {
    const parts = field.split('.');
    const formatted: string[] = [];

    for (const part of parts) {
      if (/^\d+$/.test(part)) {
        formatted.push(`item ${parseInt(part) + 1}`);
      } else if (part === '*') {
        formatted.push('item');
      } else {
        // Optimized camelCase and snake_case conversion
        let transformed = part;
        if (part.includes('_')) {
          transformed = part.replace(/_/g, ' ');
        }
        if (/[a-z][A-Z]/.test(transformed)) {
          transformed = transformed.replace(/([a-z])([A-Z])/g, '$1 $2');
        }
        formatted.push(transformed.toLowerCase());
      }
    }

    return formatted.join(' ');
  }

  /**
   * Resolve named placeholder efficiently
   */
  private resolveNamedPlaceholder(name: string, context: MessageContext): any {
    // Special handling for formats placeholder - return raw value
    if (name === 'formats') {
      const formats = (global as any).lastUnionFormats || context.parameters;
      if (Array.isArray(formats) && formats.length > 0) {
        // For union.detailed, return only the first format
        if (context.rule === 'union.detailed') {
          return formats[0];
        }
        // For regular union, join all formats
        return formats.join(' OR ');
      }
      // If no formats available, return the literal placeholder
      return '{formats}';
    }

    const placeholderNames = this.namedPlaceholderMap.get(context.rule);
    if (!placeholderNames) return null;

    const paramIndex = placeholderNames.indexOf(name);
    if (paramIndex >= 0 && paramIndex < context.parameters.length) {
      return context.parameters[paramIndex];
    }

    return null;
  }

  /**
   * Create named placeholder mapping (pre-computed)
   */
  private createNamedPlaceholderMap(): Map<string, string[]> {
    return new Map([
      // String rules
      ['string.min', ['min']],
      ['string.max', ['max']],
      ['string.length', ['length']],
      ['string.starts_with', ['prefix']],
      ['string.ends_with', ['suffix']],
      ['string.contains', ['substring']],
      ['string.in', ['options']],
      ['string.not_in', ['options']],

      // Number rules
      ['number.min', ['min']],
      ['number.max', ['max']],
      ['number.between', ['min', 'max']],
      ['number.decimal', ['places']],
      ['number.multiple_of', ['divisor']],
      ['number.in', ['options']],
      ['number.not_in', ['options']],

      // Generic rules (for tests)
      ['between', ['min', 'max']],
      ['min', ['min']],
      ['max', ['max']],

      // Date rules
      ['date.after', ['date']],
      ['date.before', ['date']],
      ['date.after_or_equal', ['date']],
      ['date.before_or_equal', ['date']],
      ['date.format', ['format']],
      ['date.timezone', ['timezone']],

      // Array rules
      ['array.min', ['min']],
      ['array.max', ['max']],
      ['array.length', ['length']],
      ['array.contains', ['value']],

      // File rules
      ['file.max', ['max']],
      ['file.min', ['min']],
      ['file.between', ['min', 'max']],
      ['file.size', ['size']],
      ['file.mimes', ['types']],
      ['file.extensions', ['extensions']],
      ['file.width', ['width']],
      ['file.height', ['height']],
      ['file.minWidth', ['minWidth']],
      ['file.minHeight', ['minHeight']],
      ['file.maxWidth', ['maxWidth']],
      ['file.maxHeight', ['maxHeight']],

      // Conditional rules
      ['required_if', ['field', 'value']],
      ['required_with', ['fields']],
      ['required_with_all', ['fields']],
      ['required_without', ['fields']],
      ['required_without_all', ['fields']],
      ['required_unless', ['field', 'value']],

      // Union rules
      ['union', ['formats']],
      ['union.detailed', ['formats']],
      ['union.failed', ['formats']],
    ]);
  }

  /**
   * Format value for display - optimized
   */
  private formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    // Handle Date objects specifically
    if (value instanceof Date) {
      return value.toISOString().split('T')[0] as string; // Returns YYYY-MM-DD format
    }
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'string') {
            return item; // Don't add quotes for string items in lists
          }
          return String(item);
        })
        .join(', ');
    }
    const type = typeof value;
    if (type === 'string') return value;
    if (type === 'object') return JSON.stringify(value);
    if (type === 'number' || type === 'boolean') return String(value);

    return String(value);
  }

  /**
   * Get value for custom placeholder
   */
  private getCustomPlaceholderValue(
    name: string,
    context: MessageContext
  ): any {
    switch (name) {
      case 'field_value':
        return context.data[context.field];
      case 'data_keys':
        return Object.keys(context.data);
      case 'parameter_count':
        return context.parameters.length;
      case 'formats':
        // Get union formats from global storage or parameters
        const formats = (global as any).lastUnionFormats || context.parameters;
        if (Array.isArray(formats)) {
          return formats.join(' OR ');
        }
        return formats || '';
      default:
        return context.value;
    }
  }

  /**
   * Add custom placeholder formatter
   */
  addPlaceholder(name: string, formatter: (value: any) => string): void {
    this.placeholderFormatters.set(name, formatter);
    // Clear template cache since new formatter might affect existing templates
    this.templateCache.clear();
  }

  /**
   * Clear caches (useful for memory management)
   */
  clearCaches(): void {
    this.templateCache.clear();
    this.fieldNameCache.clear();
  }

  /**
   * Setup default placeholder formatters
   */
  private setupDefaultFormatters(): void {
    // File size formatter
    this.addPlaceholder('file_size', (bytes: number) => {
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
      if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
    });

    // Date formatter
    this.addPlaceholder('date', (date: any) => {
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }
      return String(date);
    });

    // Array formatter - optimized
    this.addPlaceholder('array', (arr: any[]) => {
      if (Array.isArray(arr)) {
        return arr.map((item) => this.formatValue(item)).join(', ');
      }
      return String(arr);
    });

    // Number formatter
    this.addPlaceholder('number', (num: number) => {
      if (typeof num === 'number') {
        return num.toLocaleString();
      }
      return String(num);
    });

    // Capitalize formatter
    this.addPlaceholder('capitalize', (str: string) => {
      return String(str).charAt(0).toUpperCase() + String(str).slice(1);
    });

    // Remove cache clearing from setup since we're in constructor
    this.templateCache.clear();
  }
}
