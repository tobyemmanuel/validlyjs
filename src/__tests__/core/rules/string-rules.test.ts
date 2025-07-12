import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../../core/validator';
import { ValidationSchema } from '../../../types';

describe('Core Validator - String Rules', () => {
  let validator: Validator;

  describe('Basic String Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        name: 'string',
        email: 'string|email',
        url: 'string|url',
        uuid: 'string|uuid',
        json: 'string|json'
      };
      validator = new Validator(schema);
    });

    it('validates basic string types', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://example.com',
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        json: '{"key": "value"}'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid string formats', async () => {
      const data = {
        name: 123, // not a string
        email: 'invalid-email',
        url: 'not-a-url',
        uuid: 'invalid-uuid',
        json: '{invalid json}'
      };

      const result = await validator.validate(data);

      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
    });
  });

  describe('String Length Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        shortText: 'string|min:3',
        longText: 'string|max:100',
        exactText: 'string|length:10',
        rangeText: 'string|between:5,20',
        sizeText: 'string|size:8'
      };
      validator = new Validator(schema);
    });

    it('validates string length constraints', async () => {
      const data = {
        shortText: 'hello',
        longText: 'short',
        exactText: '1234567890',
        rangeText: 'medium text',
        sizeText: '12345678'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid string lengths', async () => {
      const data = {
        shortText: 'hi', // too short
        longText: 'a'.repeat(101), // too long
        exactText: 'wrong', // wrong length
        rangeText: 'hi', // too short for range
        sizeText: '1234567' // wrong size
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(5);
    });
  });

  describe('String Pattern Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        alphaOnly: 'string|alpha',
        alphaNumeric: 'string|alpha_num',
        alphaDash: 'string|alpha_dash',
        alphaSpace: 'string|alpha_space',
        regexPattern: 'string|regex:^[A-Z][a-z]+$'
      };
      validator = new Validator(schema);
    });

    it('validates string patterns', async () => {
      const data = {
        alphaOnly: 'HelloWorld',
        alphaNumeric: 'Hello123',
        alphaDash: 'hello-world_123',
        alphaSpace: 'hello world 123',
        regexPattern: 'Hello'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid patterns', async () => {
      const data = {
        alphaOnly: 'Hello123!',
        alphaNumeric: 'Hello!',
        alphaDash: 'hello world!',
        alphaSpace: 'hello-world!',
        regexPattern: 'hello' // doesn't start with uppercase
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(5);
    });
  });

  describe('String Content Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        startsWithHello: 'string|starts_with:Hello',
        endsWithWorld: 'string|ends_with:World',
        containsTest: 'string|contains:test',
        inList: 'string|in:apple,banana,orange',
        notInList: 'string|not_in:bad,worse,terrible'
      };
      validator = new Validator(schema);
    });

    it('validates string content rules', async () => {
      const data = {
        startsWithHello: 'Hello there',
        endsWithWorld: 'Hello World',
        containsTest: 'This is a test string',
        inList: 'apple',
        notInList: 'good'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid content rules', async () => {
      const data = {
        startsWithHello: 'Hi there',
        endsWithWorld: 'Hello Universe',
        containsTest: 'This is a sample string',
        inList: 'grape',
        notInList: 'bad'
      };

      const result = await validator.validate(data);

      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(5);
    });
  });

  describe('Network Format Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        ipv4: 'string|ipv4',
        ipv6: 'string|ipv6',
        ip: 'string|ip',
        mac: 'string|mac_address'
      };
      validator = new Validator(schema);
    });

    it('validates network formats', async () => {
      const data = {
        ipv4: '192.168.1.1',
        ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        ip: '10.0.0.1',
        mac: '00:1A:2B:3C:4D:5E'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid network formats', async () => {
      const data = {
        ipv4: '256.256.256.256',
        ipv6: 'invalid-ipv6',
        ip: 'not-an-ip',
        mac: 'invalid-mac'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
    });
  });

  describe('Special Format Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        hexColor: 'string|hex_color',
        creditCard: 'string|credit_card'
      };
      validator = new Validator(schema);
    });

    it('validates special formats', async () => {
      const data = {
        hexColor: '#FF0000',
        creditCard: '4532015112830366'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid special formats', async () => {
      const data = {
        hexColor: '#GG0000',
        creditCard: '1234567890123456'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(2);
    });
  });
});