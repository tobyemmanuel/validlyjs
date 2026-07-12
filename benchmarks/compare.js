const path = require('path');
const { Validator } = require(path.resolve(__dirname, '../dist/cjs/index.js'));
const z = require('zod').z;
const Joi = require('joi');

function bench(iterations, fn) {
  const start = process.hrtime.bigint();
  let p = Promise.resolve();
  for (let i = 0; i < iterations; i++) {
    const r = fn();
    if (r && typeof r.then === 'function') p = p.then(() => r);
  }
  return p.then(() => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1e6;
    return (iterations / ms) * 1000;
  });
}

const OPTS = { performance: { compileRules: true } };
const categories = [];

// ---- string ----
{
  const data = { name: 'JohnDoe', email: 'john@example.com', slug: 'john-doe' };
  const vl = new Validator({
    name: 'string|required|min:2|max:50',
    email: 'string|required|email',
    slug: 'string|required|regex:^[a-z0-9-]+$',
  }, OPTS);
  const zo = z.object({ name: z.string().min(2).max(50), email: z.string().email(), slug: z.string().regex(/^[a-z0-9-]+$/) });
  const jo = Joi.object({ name: Joi.string().min(2).max(50).required(), email: Joi.string().email().required(), slug: Joi.string().regex(/^[a-z0-9-]+$/).required() });
  categories.push({ label: 'string (email/regex)', iters: 60000, data, async: false, vl: () => vl.validateSync(data), zo: () => zo.safeParse(data), jo: () => jo.validate(data) });
}

// ---- number ----
{
  const data = { age: 30, score: 85.5 };
  const vl = new Validator({ age: 'number|required|integer|min:0|max:150', score: 'number|required|numeric|between:1,100' }, OPTS);
  const zo = z.object({ age: z.number().int().min(0).max(150), score: z.number().min(1).max(100) });
  const jo = Joi.object({ age: Joi.number().integer().min(0).max(150).required(), score: Joi.number().min(1).max(100).required() });
  categories.push({ label: 'number (int/between)', iters: 60000, data, async: false, vl: () => vl.validateSync(data), zo: () => zo.safeParse(data), jo: () => jo.validate(data) });
}

// ---- boolean ----
{
  const data = { active: true, verified: false };
  const vl = new Validator({ active: 'boolean|required', verified: 'boolean' }, OPTS);
  const zo = z.object({ active: z.boolean(), verified: z.boolean().optional() });
  const jo = Joi.object({ active: Joi.boolean().required(), verified: Joi.boolean() });
  categories.push({ label: 'boolean (req/opt)', iters: 120000, data, async: false, vl: () => vl.validateSync(data), zo: () => zo.safeParse(data), jo: () => jo.validate(data) });
}

// ---- array ----
{
  const data = { tags: ['a', 'b', 'c', 'd'] };
  const vl = new Validator({ tags: 'array|required|min:1|max:10', 'tags.*': 'string|alpha' }, OPTS);
  const zo = z.object({ tags: z.array(z.string()).min(1).max(10) });
  const jo = Joi.object({ tags: Joi.array().items(Joi.string()).min(1).max(10).required() });
  categories.push({ label: 'array (min/max + item)', iters: 40000, data, async: false, vl: () => vl.validateSync(data), zo: () => zo.safeParse(data), jo: () => jo.validate(data) });
}

// ---- nested object ----
{
  const data = { profile: { name: 'Jane', age: 25, address: { city: 'NYC', zip: '10001' } } };
  const vl = new Validator({
    profile: 'object|required',
    'profile.name': 'string|required|min:2',
    'profile.age': 'number|required|min:18',
    'profile.address.city': 'string|required',
    'profile.address.zip': 'string|required|regex:^[0-9]{5}$',
  }, OPTS);
  const zo = z.object({ profile: z.object({ name: z.string().min(2), age: z.number().min(18), address: z.object({ city: z.string(), zip: z.string().regex(/^[0-9]{5}$/) }) }) });
  const jo = Joi.object({ profile: Joi.object({ name: Joi.string().min(2).required(), age: Joi.number().min(18).required(), address: Joi.object({ city: Joi.string().required(), zip: Joi.string().regex(/^[0-9]{5}$/).required() }).required() }).required() });
  categories.push({ label: 'nested object (4 levels)', iters: 40000, data, async: false, vl: () => vl.validateSync(data), zo: () => zo.safeParse(data), jo: () => jo.validate(data) });
}

// ---- union ----
{
  const data = { id: 42 };
  const vl = new Validator({ id: 'union:(number|integer;string|min:1)' }, OPTS);
  const zo = z.object({ id: z.union([z.number().int(), z.string().min(1)]) });
  const jo = Joi.object({ id: Joi.alternatives().try(Joi.number().integer(), Joi.string().min(1)).required() });
  categories.push({ label: 'union (number|string)', iters: 60000, data, async: false, vl: () => vl.validateSync(data), zo: () => zo.safeParse(data), jo: () => jo.validate(data) });
}

// ---- file (validlyjs content-sniffing only; Zod/Joi have no equivalent) ----
{
  const PNG = new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  const file = new File([PNG], 'x.png', { type: 'image/png' });
  const vl = new Validator({ photo: 'file|image' }, OPTS);
  categories.push({ label: 'file.image (magic-byte)', iters: 8000, data: { photo: file }, async: true, vl: () => vl.validate({ photo: file }), zo: null, jo: null });
}

(async () => {
  const pad = (s, n) => String(s).padEnd(n);
  const rpad = (s, n) => String(s).padStart(n);
  console.log('');
  console.log(pad('data type', 30) + rpad('validlyjs', 14) + rpad('zod', 14) + rpad('joi', 14) + '  note');
  console.log('-'.repeat(86));
  for (const c of categories) {
    const r = {};
    r.vl = await bench(c.iters, c.vl);
    if (c.zo) r.zo = await bench(c.iters, c.zo); else r.zo = null;
    if (c.jo) r.jo = await bench(c.iters, c.jo); else r.jo = null;
    const note = c.zo == null ? 'validlyjs-only (content sniff)' : (c.async ? 'async' : 'validateSync');
    console.log(
      pad(c.label, 30) +
      rpad(Math.round(r.vl).toLocaleString(), 14) +
      rpad(r.zo == null ? 'n/a' : Math.round(r.zo).toLocaleString(), 14) +
      rpad(r.jo == null ? 'n/a' : Math.round(r.jo).toLocaleString(), 14) +
      '  ' + note
    );
  }
  console.log('-'.repeat(86));
  console.log('ops/sec, higher = faster. validlyjs sync schemas use validateSync()+compileRules.');
})();