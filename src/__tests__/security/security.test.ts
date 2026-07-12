import { describe, it, expect } from '@jest/globals';
import { Validator } from '../../core/validator';
import { FieldResolver } from '../../core/field-resolver';
import { ValidationCache, CompiledRuleCache } from '../../core/performance/cache';
import { objectHasRule } from '../../rules/object/shape';
import { detectMime, sniffFile } from '../../utils/mime';
import { safeRegexTest, analyzePattern } from '../../utils/safe-regex';

const bytesOf = (arr: number[]) => new Uint8Array(arr);
const mockFileWithBytes = (name: string, type: string, arr: number[]) => ({
  name,
  size: arr.length,
  type,
  arrayBuffer: async () => bytesOf(arr).buffer,
});

describe('Security: magic-byte file detection', () => {
  it('detects common formats from content', () => {
    expect(detectMime(bytesOf([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png');
    expect(detectMime(bytesOf([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(detectMime(bytesOf([0x25, 0x50, 0x44, 0x46]))).toBe('application/pdf');
    expect(detectMime(bytesOf([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))).toBe('image/gif');
    expect(detectMime(bytesOf([0x1a, 0x45, 0xdf, 0xa3]))).toBe('video/x-matroska');
    expect(detectMime(bytesOf([0x49, 0x44, 0x33, 0x04]))).toBe('audio/mpeg');
    expect(detectMime(bytesOf([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45]))).toBe('audio/wav');
    expect(detectMime(bytesOf([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]))).toBe('video/mp4');
  });

  it('rejects a spoofed file whose bytes do not match the claimed type', async () => {
    // Claimed PNG (name + type) but the bytes are actually a PDF.
    const data = {
      avatar: mockFileWithBytes('avatar.png', 'image/png', [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]),
    };
    const validator = new Validator({ avatar: 'file|mimes:png' });
    const result = await validator.validate(data);
    expect(result.isValid).toBe(false);
  });

  it('accepts a genuine file matching the claimed type', async () => {
    const data = {
      avatar: mockFileWithBytes('avatar.png', 'image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]),
    };
    const validator = new Validator({ avatar: 'file|mimes:png' });
    const result = await validator.validate(data);
    expect(result.isValid).toBe(true);
  });

  it('sniffFile returns null for content-less objects (falls back safely)', async () => {
    const detected = await sniffFile({ name: 'x.pdf', type: 'application/pdf' });
    expect(detected).toBeNull();
  });
});

describe('Security: regex ReDoS guard', () => {
  it('flags nested quantifiers and backreferences as unsafe', () => {
    expect(analyzePattern('(a+)+').safe).toBe(false);
    expect(analyzePattern('([a-z]*)*').safe).toBe(false);
    expect(analyzePattern('(a+)*').safe).toBe(false);
    expect(analyzePattern('\\1').safe).toBe(false);
    expect(analyzePattern('\\k<name>').safe).toBe(false);
  });

  it('allows common safe patterns', () => {
    expect(analyzePattern('^[A-Z][a-z]+$').safe).toBe(true);
    expect(analyzePattern('^\\+?[1-9]\\d{1,14}$').safe).toBe(true);
    expect(analyzePattern('(?:https?://)+').safe).toBe(true);
    expect(analyzePattern('(\\d{1,3}\\.){3}').safe).toBe(true);
  });

  it('fails closed on unsafe patterns (never runs them)', () => {
    expect(safeRegexTest('(a+)+', '', 'aaaaaaaaaaaaaaaaaaaa')).toBe(false);
  });

  it('still validates safe patterns correctly', () => {
    expect(safeRegexTest('^[A-Z][a-z]+$', '', 'Hello')).toBe(true);
    expect(safeRegexTest('^[A-Z][a-z]+$', '', 'hello')).toBe(false);
  });
});

describe('Security: prototype pollution guard', () => {
  it('does not read through __proto__ when resolving paths', () => {
    const resolver = new FieldResolver();
    const data: any = { user: { name: 'bob' } };
    // Attempt to reach an inherited/__proto__ property.
    expect(resolver.resolvePath(data, '__proto__.polluted')).toBeUndefined();
    expect(resolver.resolvePath(data, 'constructor.prototype.x')).toBeUndefined();
    // Normal access still works.
    expect(resolver.resolvePath(data, 'user.name')).toBe('bob');
  });

  it('object.has only matches own properties', () => {
    const inherited = Object.create({ inheritedProp: 1 });
    expect(objectHasRule.validate(inherited, ['inheritedProp'])).toBe(false);
    const own = { ownProp: 1 };
    expect(objectHasRule.validate(own, ['ownProp'])).toBe(true);
    expect(objectHasRule.validate(own, ['missing'])).toBe(false);
  });
});

describe('Memory: caches stay bounded', () => {
  it('ValidationCache evicts beyond its max size', () => {
    const cache: any = new ValidationCache();
    for (let i = 0; i < 1500; i++) {
      cache.set('key-' + i, { passed: true });
    }
    expect(cache.cache.size).toBeLessThanOrEqual(1000);
  });

  it('CompiledRuleCache evicts beyond its max size', () => {
    const cache: any = new CompiledRuleCache();
    for (let i = 0; i < 1500; i++) {
      cache.set('key-' + i, []);
    }
    expect(cache.cache.size).toBeLessThanOrEqual(1000);
  });
});