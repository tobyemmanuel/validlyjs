import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../../core/validator';
import { ValidationSchema } from '../../../types';

describe('Core Validator - Date Rules', () => {
  let validator: Validator;

  describe('Basic Date Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        birthdate: 'date',
        timestamp: 'date|format:YYYY-MM-DD HH:mm:ss',
        isoDate: 'date|iso',
        customFormat: 'date|format:DD/MM/YYYY'
      };
      validator = new Validator(schema);
    });

    it('validates date formats', async () => {
      const data = {
        birthdate: '1990-01-01',
        timestamp: '2023-12-25 14:30:00',
        isoDate: '2023-12-25T14:30:00.000Z',
        customFormat: '25/12/2023'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid date formats', async () => {
      const data = {
        birthdate: 'not-a-date',
        timestamp: '2023-13-45 25:70:80',
        isoDate: 'invalid-iso',
        customFormat: '2023_12/25' // wrong format
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
    });
  });

  describe('Date Range Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        afterDate: 'date|after:2023-01-01',
        beforeDate: 'date|before:2025-12-31',
        betweenDates: 'date|after:2023-01-01|before:2024-12-31',
        afterOrEqual: 'date|after_or_equal:2023-06-15',
        beforeOrEqual: 'date|before_or_equal:2023-12-31'
      };
      validator = new Validator(schema);
    });

    it('validates date ranges', async () => {
      const data = {
        afterDate: '2023-06-15',
        beforeDate: '2024-06-15',
        betweenDates: '2023-12-25',
        afterOrEqual: '2023-06-15',
        beforeOrEqual: '2023-12-31'
      };

      const result = await validator.validate(data);

      expect(result.isValid).toBe(true);
    });

    it('fails on invalid date ranges', async () => {
      const data = {
        afterDate: '2022-12-31', // before min
        beforeDate: '2026-01-01', // after max
        betweenDates: '2025-01-01', // outside range
        afterOrEqual: '2023-06-14', // before min
        beforeOrEqual: '2024-01-01' // after max
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(5);
    });
  });

  describe('Date Object Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        dateObject: 'date',
        dateString: 'date'
      };
      validator = new Validator(schema);
    });

    it('validates Date objects', async () => {
      const data = {
        dateObject: new Date('2023-12-25'),
        dateString: '2023-12-25'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid Date objects', async () => {
      const data = {
        dateObject: new Date('invalid'),
        dateString: 'invalid-date'
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(2);
    });
  });
});