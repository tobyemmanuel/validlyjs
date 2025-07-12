import { jest } from '@jest/globals';
import { MessageResolver } from '../../messages/message-resolver';
import { MessageContext, MessageConfig } from '../../types';
import enMessages from '../../messages/languages/en';

describe('MessageResolver', () => {
  let resolver: MessageResolver;
  let context: MessageContext;

  beforeEach(() => {
    resolver = new MessageResolver();
    context = {
      field: 'email',
      rule: 'string.email',
      value: 'invalid-email',
      parameters: [],
      data: { email: 'invalid-email' }
    };
  });

  describe('resolve', () => {
    it('should resolve messages from the default language pack', () => {
      const result = resolver.resolve(context);
      expect(result).toBe('The email field must be a valid email address');
    });

    it('should prioritize field-specific messages', () => {
      const config: Partial<MessageConfig> = {
        fieldMessages: {
          'email.string.email': 'Custom email validation message'
        }
      };
      
      resolver = new MessageResolver(config);
      const result = resolver.resolve(context);
      
      expect(result).toBe('Custom email validation message');
    });

    it('should use wildcard field messages when available', () => {
      const wildcardContext: MessageContext = {
        field: 'user.profile.*.email',
        rule: 'string.email',
        value: 'invalid-email',
        parameters: [],
        data: { user: { profile: { email: 'invalid-email' } } }
      };
      
      const config: Partial<MessageConfig> = {
        fieldMessages: {
          'user.profile.*.email.string.email': 'Custom wildcard email message'
        }
      };
      
      resolver = new MessageResolver(config);
      const result = resolver.resolve(wildcardContext);
      
      expect(result).toBe('Custom wildcard email message');
    });

    it('should use global rule messages when field-specific ones are not available', () => {
      const config: Partial<MessageConfig> = {
        messages: {
          'string.email': 'Global email validation message'
        }
      };
      
      resolver = new MessageResolver(config);
      const result = resolver.resolve(context);
      
      expect(result).toBe('Global email validation message');
    });

    it('should format messages with context values', () => {
      const minContext: MessageContext = {
        field: 'password',
        rule: 'string.min',
        value: '123',
        parameters: [8],
        data: { password: '123' }
      };
      
      const result = resolver.resolve(minContext);
      
      // More specific assertion to check exact formatting
      expect(result).toBe('The password field must be at least 8 characters');
    });

    it('should cache resolved messages for performance', () => {
      // Spy on the private findMessage method
      const findMessageSpy = jest.spyOn(resolver as any, 'findMessage');
      
      // First call should find the message
      resolver.resolve(context);
      expect(findMessageSpy).toHaveBeenCalledTimes(1);
      
      // Second call with same context should use cache
      resolver.resolve(context);
      expect(findMessageSpy).toHaveBeenCalledTimes(1);
      
      // Different context should find message again
      const newContext = { ...context, field: 'password' };
      resolver.resolve(newContext);
      expect(findMessageSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('language management', () => {
    it('should use the default English language pack', () => {
      expect(resolver.getLanguage()).toBe('en');
    });

    it('should allow changing the language', () => {
      resolver.setLanguage('fr');
      expect(resolver.getLanguage()).toBe('fr');
    });

    it('should allow adding custom language packs', () => {
      const frMessages = {
        'required': 'Le champ {field} est obligatoire',
        'string.email': 'Le champ {field} doit être une adresse email valide'
      };
      
      resolver.addLanguage('fr', frMessages);
      resolver.setLanguage('fr');
      
      const result = resolver.resolve(context);
      expect(result).toBe('Le champ email doit être une adresse email valide');
    });

    it('should fall back to English when a message is not available in the current language', () => {
      const partialFrMessages = {
        'required': 'Le champ {field} est obligatoire'
        // No email message
      };
      
      resolver.addLanguage('fr', partialFrMessages);
      resolver.setLanguage('fr');
      
      const result = resolver.resolve(context);
      // Should fall back to English message for email
      expect(result).toBe('The email field must be a valid email address');
    });

    it('should provide a list of available languages', () => {
      resolver.addLanguage('fr', {});
      resolver.addLanguage('es', {});
      
      const languages = resolver.getAvailableLanguages();
      expect(languages).toContain('en');
      expect(languages).toContain('fr');
      expect(languages).toContain('es');
    });
  });

  describe('configuration', () => {
    it('should allow updating configuration', () => {
      const newConfig: Partial<MessageConfig> = {
        language: 'fr',
        messages: {
          'string.email': 'New global email message'
        },
        fieldMessages: {
          'email.string.email': 'New field-specific email message'
        }
      };
      
      resolver.updateConfig(newConfig);
      
      expect(resolver.getLanguage()).toBe('fr');
      const result = resolver.resolve(context);
      expect(result).toBe('New field-specific email message');
    });

    it('should clear caches when configuration changes', () => {
      // Fill cache
      resolver.resolve(context);
      
      // Spy on the private findMessage method
      const findMessageSpy = jest.spyOn(resolver as any, 'findMessage');
      
      // Update config
      resolver.updateConfig({
        messages: { 'string.email': 'Updated message' }
      });
      
      // Cache should be cleared, so findMessage should be called again
      resolver.resolve(context);
      expect(findMessageSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('cache management', () => {
    it('should provide cache statistics', () => {
      // Fill caches
      resolver.resolve(context);
      resolver.resolve({ ...context, field: 'password', rule: 'required' });
      
      const stats = resolver.getCacheStats();
      
      expect(stats.messageCache).toBeGreaterThan(0);
      expect(stats.wildcardPatternCache).toBeGreaterThanOrEqual(0);
      expect(stats.fieldSegmentCache).toBeGreaterThanOrEqual(0);
      expect(stats.languagePacks).toBeGreaterThan(0);
    });

    it('should clear all caches when requested', () => {
      // Fill caches
      resolver.resolve(context);
      
      // Clear caches
      resolver.clearCaches();
      
      // Get stats to verify caches are empty
      const stats = resolver.getCacheStats();
      expect(stats.messageCache).toBe(0);
    });
  });
});


// Add this describe block to the existing file

describe('Union Rule Message Resolution', () => {
  it('should resolve union rule messages with format descriptions', () => {
    const unionContext: MessageContext = {
      field: 'identifier',
      rule: 'union',
      value: 'invalid-value',
      parameters: [],
      data: { identifier: 'invalid-value' }
    };
    let resolver = new MessageResolver();
    
    const result = resolver.resolve(unionContext);
    expect(result).toBe('The identifier field must match one of these formats: {formats}');
  });

  it('should handle union rule with custom field messages', () => {
    const config: Partial<MessageConfig> = {
      fieldMessages: {
        'identifier.union': 'The identifier must be either a UUID or email address'
      }
    };
    
    let resolver = new MessageResolver(config);
    
    const unionContext: MessageContext = {
      field: 'identifier',
      rule: 'union',
      value: 'invalid-value',
      parameters: [],
      data: { identifier: 'invalid-value' }
    };
    
    const result = resolver.resolve(unionContext);
    expect(result).toBe('The identifier must be either a UUID or email address');
  });

  it('should resolve union rule messages with detailed format information', () => {
    const config: Partial<MessageConfig> = {
      messages: {
        'union.detailed': 'The {field} field must match one of these formats: {formats}'
      }
    };
    
    let resolver = new MessageResolver(config);
    
    const unionContext: MessageContext = {
      field: 'value',
      rule: 'union.detailed',
      value: 'test',
      parameters: ['a valid email address', 'at least 8 characters'],
      data: { value: 'test' }
    };
    
    const result = resolver.resolve(unionContext);
    expect(result).toBe('The value field must match one of these formats: a valid email address');
  });
});