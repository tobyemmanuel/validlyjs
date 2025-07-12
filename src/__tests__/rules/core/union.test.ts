import { describe, it, expect, beforeEach } from '@jest/globals';
import { unionRule } from '../../../rules/core/union';
import { ParsedRule } from '../../../types/parsers';

describe('Union Rule', () => {
  let data: Record<string, any>;

  beforeEach(() => {
    data = { user: { profile: { name: null } } };
  });

  describe('Basic Union Validation', () => {
    it('passes when value matches first rule set', async () => {
      const ruleSets: ParsedRule[][] = [
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.min', parameters: [3], modifiers: [] }
        ],
        [
          { name: 'number', parameters: [], modifiers: [] },
          { name: 'number.min', parameters: [10], modifiers: [] }
        ]
      ];

      const result = await unionRule.validate('hello', [ruleSets], 'name', data);
      expect(result).toBe(true);
    });

    it('passes when value matches second rule set', async () => {
      const ruleSets: ParsedRule[][] = [
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.min', parameters: [10], modifiers: [] }
        ],
        [
          { name: 'number', parameters: [], modifiers: [] },
          { name: 'number.min', parameters: [5], modifiers: [] }
        ]
      ];

      const result = await unionRule.validate(15, [ruleSets], 'age', data);
      expect(result).toBe(true);
    });

    it('fails when value matches no rule sets', async () => {
      const ruleSets: ParsedRule[][] = [
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.min', parameters: [10], modifiers: [] }
        ],
        [
          { name: 'number', parameters: [], modifiers: [] },
          { name: 'number.min', parameters: [20], modifiers: [] }
        ]
      ];

      const result = await unionRule.validate('hi', [ruleSets], 'name', data);
      expect(result).toBe(false);
    });

    it('fails with empty rule sets', async () => {
      const result = await unionRule.validate('test', [[]], 'name', data);
      expect(result).toBe(false);
    });

    it('fails with no rule sets', async () => {
      const result = await unionRule.validate('test', [], 'name', data);
      expect(result).toBe(false);
    });
  });

  describe('Complex Union Scenarios', () => {
    it('handles string or email validation', async () => {
      const ruleSets: ParsedRule[][] = [
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.min', parameters: [2], modifiers: [] },
          { name: 'string.max', parameters: [50], modifiers: [] }
        ],
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.email', parameters: [], modifiers: [] }
        ]
      ];

      // Should pass for regular string
      expect(await unionRule.validate('John Doe', [ruleSets], 'name', data)).toBe(true);
      
      // Should pass for email
      expect(await unionRule.validate('john@example.com', [ruleSets], 'name', data)).toBe(true);
      
      // Should fail for too short string that's not an email
      expect(await unionRule.validate('J', [ruleSets], 'name', data)).toBe(false);
    });

    it('handles number or string validation', async () => {
      const ruleSets: ParsedRule[][] = [
        [
          { name: 'number', parameters: [], modifiers: [] },
          { name: 'number.min', parameters: [0], modifiers: [] }
        ],
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.min', parameters: [1], modifiers: [] }
        ]
      ];

      expect(await unionRule.validate(42, [ruleSets], 'value', data)).toBe(true);
      expect(await unionRule.validate('hello', [ruleSets], 'value', data)).toBe(true);
      expect(await unionRule.validate(null, [ruleSets], 'value', data)).toBe(false);
    });

    it('handles multiple complex rule combinations', async () => {
      const ruleSets: ParsedRule[][] = [
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.uuid', parameters: [], modifiers: [] }
        ],
        [
          { name: 'number', parameters: [], modifiers: [] },
          { name: 'number.integer', parameters: [], modifiers: [] },
          { name: 'number.min', parameters: [1], modifiers: [] }
        ],
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.email', parameters: [], modifiers: [] }
        ]
      ];

      // UUID should pass
      expect(await unionRule.validate('123e4567-e89b-12d3-a456-426614174000', [ruleSets], 'id', data)).toBe(true);
      
      // Positive integer should pass
      expect(await unionRule.validate(42, [ruleSets], 'id', data)).toBe(true);
      
      // Email should pass
      expect(await unionRule.validate('test@example.com', [ruleSets], 'id', data)).toBe(true);
      
      // Invalid values should fail
      expect(await unionRule.validate('invalid-uuid', [ruleSets], 'id', data)).toBe(false);
      expect(await unionRule.validate(-5, [ruleSets], 'id', data)).toBe(false);
      expect(await unionRule.validate('not-an-email', [ruleSets], 'id', data)).toBe(false);
    });
  });

  describe('Stop on First Pass Option', () => {
    it('stops on first pass when stopOnFirstPass is true', async () => {
      const ruleSets: ParsedRule[][] = [
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.min', parameters: [3], modifiers: [] }
        ],
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.email', parameters: [], modifiers: [] }
        ]
      ];

      const result = await unionRule.validate('hello', [ruleSets, true], 'name', data);
      expect(result).toBe(true);
    });

    it('continues validation when stopOnFirstPass is false', async () => {
      const ruleSets: ParsedRule[][] = [
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.min', parameters: [3], modifiers: [] }
        ],
        [
          { name: 'string', parameters: [], modifiers: [] },
          { name: 'string.email', parameters: [], modifiers: [] }
        ]
      ];

      const result = await unionRule.validate('hello', [ruleSets, false], 'name', data);
      expect(result).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid rule sets gracefully', async () => {
      const invalidRuleSets = [
        [
          { name: 'nonexistent.rule', parameters: [], modifiers: [] }
        ]
      ];

      const result = await unionRule.validate('test', [invalidRuleSets], 'name', data);
      expect(result).toBe(false);
    });

    it('handles malformed parameters', async () => {
      const result = await unionRule.validate('test', [null], 'name', data);
      expect(result).toBe(false);
    });
  });

  describe('Message and Properties', () => {
    it('has correct message template', () => {
      expect(unionRule.message).toBe('The {field} field must match one of these formats: {formats}');
    });

    it('is marked as async', () => {
      expect(unionRule.async).toBe(true);
    });

    it('has correct priority', () => {
      expect(unionRule.priority).toBe(1);
    });

    it('has correct name', () => {
      expect(unionRule.name).toBe('union');
    });
  });
});