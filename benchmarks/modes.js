const path = require('path');
const V = require(path.resolve(__dirname, '../dist/cjs/index.js'));
const z = require('zod').z;
const Joi = require('joi');
const OPTS = { performance: { compileRules: true } };

function bench(iters, fn) {
  for (let i = 0; i < iters; i++) fn();
  const start = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) fn();
  const end = process.hrtime.bigint();
  return (iters / (Number(end - start) / 1e6)) * 1000;
}
const pad = (s, n) => String(s).padEnd(n);
const rpad = (s, n) => String(s).padStart(n);

const categories = [];

// ---- string ----
{
  const data = { name: 'JohnDoe', email: 'john@example.com', slug: 'john-doe' };
  categories.push({
    label: 'string', iters: 60000, data,
    modes: {
      string: () => new V.Validator({ name: 'string|required|min:2|max:50', email: 'string|required|email', slug: 'string|required|regex:^[a-z0-9-]+$' }, OPTS),
      array: () => new V.Validator({ name: ['required','string','min:2','max:50'], email: ['required','string','email'], slug: ['required','string','regex:^[a-z0-9-]+$'] }, OPTS),
      fluent: () => new V.Validator({ name: V.string().required().min(2).max(50), email: V.string().required().email(), slug: V.string().required().regex('^[a-z0-9-]+$') }, OPTS),
    },
    zo: () => z.object({ name: z.string().min(2).max(50), email: z.string().email(), slug: z.string().regex(/^[a-z0-9-]+$/) }).safeParse(data),
    jo: () => Joi.object({ name: Joi.string().min(2).max(50).required(), email: Joi.string().email().required(), slug: Joi.string().regex(/^[a-z0-9-]+$/).required() }).validate(data),
  });
}

// ---- number ----
{
  const data = { age: 30, score: 85.5 };
  categories.push({
    label: 'number', iters: 60000, data,
    modes: {
      string: () => new V.Validator({ age: 'number|required|integer|min:0|max:150', score: 'number|required|min:1|max:100' }, OPTS),
      array: () => new V.Validator({ age: ['required','number','integer','min:0','max:150'], score: ['required','number','min:1','max:100'] }, OPTS),
      fluent: () => new V.Validator({ age: V.number().required().integer().min(0).max(150), score: V.number().required().min(1).max(100) }, OPTS),
    },
    zo: () => z.object({ age: z.number().int().min(0).max(150), score: z.number().min(1).max(100) }).safeParse(data),
    jo: () => Joi.object({ age: Joi.number().integer().min(0).max(150).required(), score: Joi.number().min(1).max(100).required() }).validate(data),
  });
}

// ---- array ----
{
  const data = { tags: ['a','b','c','d'] };
  categories.push({
    label: 'array', iters: 40000, data,
    modes: {
      string: () => new V.Validator({ tags: 'array|required|min:1|max:10', 'tags.*': 'string|alpha' }, OPTS),
      array: () => new V.Validator({ tags: ['required','array','min:1','max:10'], 'tags.*': ['string','alpha'] }, OPTS),
      fluent: () => new V.Validator({ tags: V.array().required().min(1).max(10), 'tags.*': V.string().alpha() }, OPTS),
    },
    zo: () => z.object({ tags: z.array(z.string()).min(1).max(10) }).safeParse(data),
    jo: () => Joi.object({ tags: Joi.array().items(Joi.string()).min(1).max(10).required() }).validate(data),
  });
}

console.log('');
console.log(pad('data',10) + rpad('bld str',10) + rpad('bld arr',10) + rpad('bld flu',10) + rpad('vl str',12) + rpad('vl arr',12) + rpad('vl flu',12) + rpad('zod',12) + 'joi');
console.log('-'.repeat(100));
for (const c of categories) {
  const tStr = process.hrtime.bigint(); c.modes.string(); const bStr = Number(process.hrtime.bigint()-tStr)/1e6;
  const tArr = process.hrtime.bigint(); c.modes.array(); const bArr = Number(process.hrtime.bigint()-tArr)/1e6;
  const tFlu = process.hrtime.bigint(); c.modes.fluent(); const bFlu = Number(process.hrtime.bigint()-tFlu)/1e6;

  const vStr = c.modes.string(), vArr = c.modes.array(), vFlu = c.modes.fluent();
  const oStr = bench(c.iters, () => vStr.validateSync(c.data));
  const oArr = bench(c.iters, () => vArr.validateSync(c.data));
  const oFlu = bench(c.iters, () => vFlu.validateSync(c.data));
  const oZo = bench(c.iters, c.zo);
  const oJo = bench(c.iters, c.jo);

  console.log(
    pad(c.label,10) +
    rpad(bStr.toFixed(2),10) + rpad(bArr.toFixed(2),10) + rpad(bFlu.toFixed(2),10) +
    rpad(Math.round(oStr).toLocaleString(),12) + rpad(Math.round(oArr).toLocaleString(),12) + rpad(Math.round(oFlu).toLocaleString(),12) +
    rpad(Math.round(oZo).toLocaleString(),12) + Math.round(oJo).toLocaleString()
  );
}
console.log('-'.repeat(100));
console.log('bld = ms to construct+compile one Validator (parse cost). vl = validlyjs ops/sec via validateSync.');
console.log('After compilation all 3 modes run the SAME compiled rules, so throughput is ~identical; only build/parse cost differs.');