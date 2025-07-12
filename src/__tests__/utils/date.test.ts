import { describe, it, expect } from '@jest/globals';
import { parseDateString } from '../../utils/date';

describe('parseDateString', () => {
  it('parses DD/MM/YYYY and DD-MM-YYYY', () => {
    expect(parseDateString('25/12/2023')).toBeInstanceOf(Date);
    expect((parseDateString('25/12/2023') as Date)?.toISOString()).toBe('2023-12-25T00:00:00.000Z');
    expect(parseDateString('25-12-2023')).toBeInstanceOf(Date);
    expect((parseDateString('25-12-2023') as Date)?.toISOString()).toBe('2023-12-25T00:00:00.000Z');
  });

  it('parses dates with 24-hour time (HH:mm:ss)', () => {
    expect(parseDateString('25/12/2023 14:30:00')).toBeInstanceOf(Date);
    expect((parseDateString('25/12/2023 14:30:00') as Date)?.toISOString()).toMatch(/^2023-12-25T14:30:00/);
    expect(parseDateString('25-12-2023 14:30:00')).toBeInstanceOf(Date);
    expect((parseDateString('25-12-2023 14:30:00') as Date)?.toISOString()).toMatch(/^2023-12-25T14:30:00/);
  });

  it('parses dates with 24-hour time (HH:mm)', () => {
    expect(parseDateString('25/12/2023 14:30')).toBeInstanceOf(Date);
    expect((parseDateString('25/12/2023 14:30') as Date)?.toISOString()).toMatch(/^2023-12-25T14:30:00/);
    expect(parseDateString('25-12-2023 14:30')).toBeInstanceOf(Date);
    expect((parseDateString('25-12-2023 14:30') as Date)?.toISOString()).toMatch(/^2023-12-25T14:30:00/);
  });

  it('parses dates with 12-hour time (h:mm a, h:mm:ss a)', () => {
    expect(parseDateString('25/12/2023 2:30 PM')).toBeInstanceOf(Date);
    expect((parseDateString('25/12/2023 2:30 PM') as Date)?.toISOString()).toMatch(/^2023-12-25T14:30:00/);
    expect(parseDateString('25-12-2023 2:30 AM')).toBeInstanceOf(Date);
    expect((parseDateString('25-12-2023 2:30 AM') as Date)?.toISOString()).toMatch(/^2023-12-25T02:30:00/);
    expect(parseDateString('25/12/2023 2:30:45 pm')).toBeInstanceOf(Date);
    expect((parseDateString('25/12/2023 2:30:45 pm') as Date)?.toISOString()).toMatch(/^2023-12-25T14:30:45/);
    expect(parseDateString('25-12-2023 2:30:45 AM')).toBeInstanceOf(Date);
    expect((parseDateString('25-12-2023 2:30:45 AM') as Date)?.toISOString()).toMatch(/^2023-12-25T02:30:45/);
  });

  it('parses ISO 8601', () => {
    expect(parseDateString('2023-12-25T14:30:00.000Z')).toBeInstanceOf(Date);
    expect((parseDateString('2023-12-25T14:30:00.000Z') as Date)?.toISOString()).toBe('2023-12-25T14:30:00.000Z');
  });

  it('returns string for valid time-only inputs', () => {
    expect(parseDateString('14:30:00')).toBe('14:30:00');
    expect(parseDateString('14:30')).toBe('14:30');
    expect(parseDateString('2:30 PM')).toBe('2:30 PM');
    expect(parseDateString('2:30:45 AM')).toBe('2:30:45 AM');
    expect(parseDateString('2:30 pm')).toBe('2:30 pm');
    expect(parseDateString('2:30:45 am')).toBe('2:30:45 am');
  });

  it('returns null for invalid dates', () => {
    // Invalid day
    expect(parseDateString('31/04/2023')).toBeNull();
    expect(parseDateString('31-04-2023')).toBeNull();
    // Invalid month
    expect(parseDateString('25/13/2023')).toBeNull();
    expect(parseDateString('25-13-2023')).toBeNull();
    // Invalid leap year
    expect(parseDateString('29/02/2023')).toBeNull();
    // Valid leap year
    expect(parseDateString('29/02/2024')).toBeInstanceOf(Date);
    expect((parseDateString('29/02/2024') as Date)?.toISOString()).toBe('2024-02-29T00:00:00.000Z');
    // Invalid time
    expect(parseDateString('25/12/2023 25:70:80')).toBeNull();
    expect(parseDateString('25-12-2023 14:60')).toBeNull();
    expect(parseDateString('25/12/2023 13:00 PM')).toBeNull();
  });

  it('returns null for invalid time-only inputs', () => {
    expect(parseDateString('25:70:80')).toBeNull(); // Invalid hours
    expect(parseDateString('14:60')).toBeNull(); // Invalid minutes
    expect(parseDateString('13:00 XM')).toBeNull(); // Invalid period
    expect(parseDateString('2:75:45 PM')).toBeNull(); // Invalid minutes
  });

  it('returns null for non-string input', () => {
    expect(parseDateString(123 as any)).toBeNull();
    expect(parseDateString(null as any)).toBeNull();
  });
});