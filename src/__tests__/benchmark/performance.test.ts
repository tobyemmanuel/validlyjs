import { describe, it, expect } from '@jest/globals';
import { Validator } from '../../core/validator';
import { safeRegexTest } from '../../utils/safe-regex';
import { detectMime } from '../../utils/mime';

function bench(name: string, iterations: number, fn: () => unknown | Promise<unknown>): Promise<number> {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    let p: Promise<unknown> = Promise.resolve();
    for (let i = 0; i < iterations; i++) {
      const r = fn();
      if (r && typeof (r as Promise<unknown>).then === 'function') p = p.then(() => r as Promise<unknown>);
    }
    p.then(() => {
      const end = process.hrtime.bigint();
      const ms = Number(end - start) / 1e6;
      // eslint-disable-next-line no-console
      console.log(`${name.padEnd(36)} ${(iterations / ms * 1000).toFixed(0).padStart(10)} ops/sec  (${ms.toFixed(1)} ms / ${iterations})`);
      resolve(ms);
    });
  });
}

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const PNG_FILE = new File([PNG], 'x.png', { type: 'image/png' });
const JPEG_FILE = new File([JPEG], 'x.jpeg', { type: 'image/jpeg' });

describe('Benchmark: performance by data type', () => {
  it('string rules', async () => {
    const v = new Validator({ name: 'string|required|min:2|max:50|alpha', email: 'string|required|email', slug: 'string|required|regex:^[a-z0-9-]+$' });
    const data = { name: 'JohnDoe', email: 'john@example.com', slug: 'john-doe' };
    await bench('string (alpha/email/regex)', 20000, () => v.validate(data));
    expect((await v.validate(data)).isValid).toBe(true);
  });

  it('number rules', async () => {
    const v = new Validator({ age: 'number|required|integer|min:0|max:150', score: 'number|required|numeric|between:1,100' });
    const data = { age: 30, score: 85.5 };
    await bench('number (integer/numeric/between)', 20000, () => v.validate(data));
    expect((await v.validate(data)).isValid).toBe(true);
  });

  it('boolean rules', async () => {
    const v = new Validator({ active: 'boolean|required', verified: 'boolean' });
    const data = { active: true, verified: false };
    await bench('boolean (required/boolean)', 40000, () => v.validate(data));
    expect((await v.validate(data)).isValid).toBe(true);
  });

  it('date rules', async () => {
    const v = new Validator({ created: 'date|required|iso', range: 'date|after:2020-01-01|before:2030-01-01' });
    const data = { created: '2023-05-12', range: '2024-01-01' };
    await bench('date (iso/after/before)', 20000, () => v.validate(data));
    expect((await v.validate(data)).isValid).toBe(true);
  });

  it('array rules', async () => {
    const v = new Validator({ tags: 'array|required|min:1|max:10', 'tags.*': 'string|alpha' });
    const data = { tags: ['a', 'b', 'c', 'd'] };
    await bench('array (min/max + wildcard)', 15000, () => v.validate(data));
    expect((await v.validate(data)).isValid).toBe(true);
  });

  it('nested object (shape)', async () => {
    const v = new Validator({
      profile: 'object|required',
      'profile.name': 'string|required|min:2',
      'profile.age': 'number|required|min:18',
      'profile.address.city': 'string|required',
      'profile.address.zip': 'string|required|regex:^[0-9]{5}$',
    });
    const data = { profile: { name: 'Jane', age: 25, address: { city: 'NYC', zip: '10001' } } };
    await bench('nested object (4 levels)', 15000, () => v.validate(data));
    expect((await v.validate(data)).isValid).toBe(true);
  });

  it('union rules', async () => {
    const v = new Validator({ id: 'union:(number|integer;string|min:1)' });
    const data = { id: 42 };
    await bench('union (integer|string)', 30000, () => v.validate(data));
    expect((await v.validate(data)).isValid).toBe(true);
  });

  it('file content sniffing (image)', async () => {
    const v = new Validator({ photo: 'file|image' });
    await bench('file.image (magic-byte sniff)', 8000, () => v.validate({ photo: PNG_FILE }));
    expect((await v.validate({ photo: PNG_FILE })).isValid).toBe(true);
  });

  it('file mimes by content', async () => {
    const v = new Validator({ doc: 'file|mimes:png,jpeg' });
    await bench('file.mimes (png content)', 8000, () => v.validate({ doc: PNG_FILE }));
    expect((await v.validate({ doc: JPEG_FILE })).isValid).toBe(true);
  });

  it('regex LRU cache (hot pattern)', () => {
    const pat = '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';
    safeRegexTest(pat, '', 'a@b.co');
    return bench('regex LRU (cached hot)', 300000, () => safeRegexTest(pat, '', 'a@b.co'));
  });

  it('regex LRU cache (cold/distinct patterns)', () => {
    const patterns = Array.from({ length: 2000 }, (_, i) => `^user${i}[0-9]+$`);
    let n = 0;
    return bench('regex LRU (distinct, evicting)', 200000, () => {
      const p = patterns[n++ % patterns.length];
      return safeRegexTest(p, '', 'user' + (n % 100) + '42');
    });
  });

  it('magic-byte detection (no allocation loop)', () => {
    return bench('detectMime (PNG header)', 500000, () => detectMime(PNG));
  });

  it('validation cache hit (primitive-only, repeated)', async () => {
    const v = new Validator({ a: 'number|required|integer|min:0', b: 'string|required|alpha' });
    const data = { a: 1, b: 'x' };
    await bench('validation cache HIT (repeat)', 20000, () => v.validate(data));
    expect((await v.validate(data)).isValid).toBe(true);
  });

  it('large payload (deep nesting + arrays)', async () => {
    const v = new Validator({
      users: 'array|required|max:100',
      'users.*.id': 'number|required|integer',
      'users.*.name': 'string|required|min:1|max:50',
      'users.*.email': 'string|required|email',
      'users.*.roles.*': 'string|alpha',
      meta: 'object',
      'meta.priority': 'number|integer|between:1,5',
    });
    const users = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      name: 'UserName',
      email: 'u' + i + '@example.com',
      roles: ['admin', 'user'],
    }));
    const data = { users, meta: { priority: 3 } };
    await bench('large payload (50 users deep)', 3000, () => v.validate(data));
    expect((await v.validate(data)).isValid).toBe(true);
  });
});