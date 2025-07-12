import {
  MessageConfig,
  MessageContext,
  LanguagePack,
} from '../types/messages.js';
import { MessageFormatter } from './formatter';
import { getMessageBridge } from './message-bridge';
import enMessages from './languages/en';
import esMessages from './languages/es';
import frMessages from './languages/fr';

interface CachedWildcardPattern {
  pattern: string;
  segments: string[];
}

export class MessageResolver {
  private config: MessageConfig;
  private formatter: MessageFormatter;
  private languagePacks: Map<string, LanguagePack>;

  // Performance caches
  private messageCache: Map<string, string> = new Map();
  private wildcardPatternCache: Map<string, CachedWildcardPattern[]> = new Map();
  private fieldSegmentCache: Map<string, string[]> = new Map();
  private currentLanguagePack: LanguagePack | null = null;
  private currentLanguage: string = '';

  // Pre-computed frequently used values
  private bridge: any = null;
  private enLanguagePack: LanguagePack | null = null;

  constructor(config: Partial<MessageConfig> = {}) {
    this.config = {
      language: 'en',
      messages: {},
      fieldMessages: {},
      customLanguages: {},
      ...config,
    };

    this.formatter = new MessageFormatter();
    this.languagePacks = new Map();
    this.loadDefaultLanguages();
    this.updateCurrentLanguagePack();
    
    // Pre-cache bridge and English pack
    this.bridge = getMessageBridge();
    this.enLanguagePack = this.languagePacks.get('en') || null;
  }

  /**
   * Resolve message for a specific validation error - optimized version
   */
  resolve(context: MessageContext): string {
    // Create cache key for this specific context
    const cacheKey = `${context.field}:${context.rule}:${this.currentLanguage}`;

    // Check message cache first
    let message = this.messageCache.get(cacheKey);
    if (message === undefined) {
      message = this.findMessage(context);
      this.messageCache.set(cacheKey, message);
    }

    return this.formatter.format(message, context);
  }

  /**
   * Find the most specific message for the given context - optimized
   */
  private findMessage(context: MessageContext): string {
    const { field, rule } = context;
    const { fieldMessages, messages } = this.config;

    // 1. Check field-specific messages first (highest priority)
    const fieldRuleKey = `${field}.${rule}`;
    const fieldSpecificMessage = fieldMessages[fieldRuleKey];
    if (fieldSpecificMessage) {
      return fieldSpecificMessage;
    }

    // 2. Check wildcard field messages
    const wildcardMessage = this.findWildcardMessageOptimized(
      field,
      rule,
      fieldMessages
    );
    if (wildcardMessage) {
      return wildcardMessage;
    }

    // 3. Check global rule messages
    const globalMessage = messages[rule];
    if (globalMessage) {
      return globalMessage;
    }

    // 4. Check current language pack (PRIMARY SOURCE)
    if (this.currentLanguagePack) {
      const langMessage = this.currentLanguagePack[rule];
      if (langMessage) {
        return langMessage;
      }
    }

    // 5. Check custom rule default messages via bridge (FALLBACK)
    if (this.bridge) {
      const customRuleMessage = this.bridge.getCustomRuleMessage(rule);
      if (customRuleMessage) {
        return customRuleMessage;
      }
    }

    // 6. Fallback to default English if different language
    if (this.currentLanguage !== 'en' && this.enLanguagePack) {
      const enMessage = this.enLanguagePack[rule];
      if (enMessage) {
        return enMessage;
      }
    }

    // 7. Ultimate fallback
    return `The ${field} field is invalid`;
  }

  /**
   * Optimized wildcard message finder with caching
   */
  private findWildcardMessageOptimized(
    field: string,
    rule: string,
    fieldMessages: Record<string, string>
  ): string | null {
    // Get or create cached wildcard patterns for this field
    let patterns = this.wildcardPatternCache.get(field);
    if (!patterns) {
      patterns = this.generateWildcardPatterns(field);
      this.wildcardPatternCache.set(field, patterns);
    }

    // Check each pattern for a matching message
    for (let i = 0; i < patterns.length; i++) {
      const wildcardKey = `${patterns?.[i]?.pattern}.${rule}`;
      const message = fieldMessages[wildcardKey];
      if (message) {
        return message;
      }
    }

    return null;
  }

  /**
   * Pre-generate wildcard patterns for a field path
   */
  private generateWildcardPatterns(field: string): CachedWildcardPattern[] {
    const segments = this.getFieldSegments(field);
    const patterns: CachedWildcardPattern[] = [];

    // Pre-allocate array
    patterns.length = segments.length;

    // Generate patterns from most specific to least specific
    for (let i = segments.length - 1; i >= 0; i--) {
      const patternSegments = segments.slice(); // Faster than spread operator
      patternSegments[i] = '*';

      patterns[segments.length - 1 - i] = {
        pattern: patternSegments.join('.'),
        segments: patternSegments,
      };
    }

    return patterns;
  }

  /**
   * Get field segments with caching
   */
  private getFieldSegments(field: string): string[] {
    let segments = this.fieldSegmentCache.get(field);
    if (!segments) {
      segments = field.split('.');
      this.fieldSegmentCache.set(field, segments);
    }
    return segments;
  }

  /**
   * Update current language pack cache
   */
  private updateCurrentLanguagePack(): void {
    if (this.currentLanguage !== this.config.language) {
      this.currentLanguage = this.config.language;
      this.currentLanguagePack = this.getLanguagePack(this.config.language);
    }
  }

  /**
   * Get language pack for given language
   */
  private getLanguagePack(language: string): LanguagePack {
    let pack = this.languagePacks.get(language);
    if (!pack) {
      // Try to load custom language
      const customPack = this.config.customLanguages[language];
      if (customPack) {
        this.languagePacks.set(language, customPack);
        pack = customPack;
      } else {
        // Fallback to empty pack
        pack = {};
        this.languagePacks.set(language, pack);
      }
    }

    return pack;
  }

  /**
   * Load default language packs
   */
  private loadDefaultLanguages(): void {
    this.languagePacks.set('en', enMessages);
    this.languagePacks.set('es', esMessages);
    this.languagePacks.set('fr', frMessages);
  }

  /**
   * Add or update language pack
   */
  addLanguage(language: string, messages: LanguagePack): void {
    this.languagePacks.set(language, messages);
    this.config.customLanguages[language] = messages;

    // Update cached English pack if needed
    if (language === 'en') {
      this.enLanguagePack = messages;
    }

    // Clear caches that might be affected
    this.clearLanguageRelatedCaches();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MessageConfig>): void {
    const oldLanguage = this.config.language;
    this.config = { ...this.config, ...config };

    // Clear caches if language changed or field messages changed
    if (
      oldLanguage !== this.config.language ||
      config.fieldMessages ||
      config.messages
    ) {
      this.clearCaches();
    }

    this.updateCurrentLanguagePack();
  }

  /**
   * Set language
   */
  setLanguage(language: string): void {
    if (this.config.language !== language) {
      this.config.language = language;
      this.updateCurrentLanguagePack();
      // Clear message cache since language affects message resolution
      this.messageCache.clear();
    }
  }

  /**
   * Get current language
   */
  getLanguage(): string {
    return this.config.language;
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages(): string[] {
    return Array.from(this.languagePacks.keys());
  }

  /**
   * Clear all caches (useful for memory management)
   */
  clearCaches(): void {
    this.messageCache.clear();
    this.wildcardPatternCache.clear();
    this.fieldSegmentCache.clear();
    this.updateCurrentLanguagePack();
  }

  /**
   * Clear only language-related caches
   */
  private clearLanguageRelatedCaches(): void {
    this.messageCache.clear();
    this.updateCurrentLanguagePack();
  }

  /**
   * Get cache statistics (useful for debugging/monitoring)
   */
  getCacheStats(): {
    messageCache: number;
    wildcardPatternCache: number;
    fieldSegmentCache: number;
    languagePacks: number;
  } {
    return {
      messageCache: this.messageCache.size,
      wildcardPatternCache: this.wildcardPatternCache.size,
      fieldSegmentCache: this.fieldSegmentCache.size,
      languagePacks: this.languagePacks.size,
    };
  }
}