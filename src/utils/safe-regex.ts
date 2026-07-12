/**
 * Safe regular-expression handling for user or schema-supplied patterns.
 *
 * Validation schemas can include arbitrary regex patterns (for example string().regex(...)
 * or the regex:... Laravel-style rule). Running an attacker-controlled or poorly written
 * pattern against untrusted input can trigger catastrophic backtracking (ReDoS) and hang the
 * process.
 *
 * This module:
 *  - analyses a pattern and rejects dangerous constructs (nested unbounded quantifiers and
 *    backreferences) plus oversized or flag-abusing patterns,
 *  - fails closed: an unsafe pattern never runs,
 *  - caches compiled RegExp instances to avoid recompiling on every call.
 */

export interface SafePatternResult {
  safe: boolean;
  reason?: string;
}

const MAX_PATTERN_LENGTH = 1000;

// Only these flags are permitted; anything else is rejected.
const SAFE_FLAGS = /^[gimsuy]*$/;

// Backreferences make a pattern's match length depend on captured groups -> ReDoS prone.
const BACKREFERENCE = /\\(\d)|\\k\s*</;

// A quantified group containing another unbounded quantifier, e.g. (a+)+, ([a-z]*)*, (a+)*.
// Only unbounded inner/outer quantifiers (+ or *) are treated as dangerous; bounded {n,m}
// repetition and optional ? are excluded to avoid false positives on common safe patterns
// such as (?:https?://)+ or (\d{1,3}\.){3}.
const NESTED_QUANTIFIER = /\(([^()]*[+*][^()]*)\)\s*[+*]/;

// One level of nesting: ((ab)+)+, etc.
const NESTED_QUANTIFIER_DEEP = /\(([^()]*\([^()]*[+*][^()]*\)[^()]*)\)\s*[+*]/;

export function analyzePattern(pattern: string, flags = ''): SafePatternResult {
  if (typeof pattern !== 'string' || pattern.length === 0) {
    return { safe: false, reason: 'empty pattern' };
  }
  if (pattern.length > MAX_PATTERN_LENGTH) {
    return { safe: false, reason: 'pattern too long' };
  }
  if (typeof flags !== 'string' || !SAFE_FLAGS.test(flags)) {
    return { safe: false, reason: 'disallowed flag' };
  }
  if (BACKREFERENCE.test(pattern)) {
    return { safe: false, reason: 'backreference' };
  }
  if (NESTED_QUANTIFIER.test(pattern) || NESTED_QUANTIFIER_DEEP.test(pattern)) {
    return { safe: false, reason: 'nested quantifier' };
  }
  return { safe: true };
}

// Bounded LRU of compiled RegExp instances (keyed by pattern + flags).
const REGEX_CACHE_MAX = 500;
const regexCache = new Map<string, RegExp>();

function getCachedRegExp(pattern: string, flags: string): RegExp {
  const key = pattern + ' ' + flags;
  const cached = regexCache.get(key);
  if (cached) {
    regexCache.delete(key);
    regexCache.set(key, cached);
    return cached;
  }
  const regex = new RegExp(pattern, flags);
  if (regexCache.size >= REGEX_CACHE_MAX) {
    const oldest = regexCache.keys().next().value;
    if (oldest !== undefined) regexCache.delete(oldest);
  }
  regexCache.set(key, regex);
  return regex;
}

export interface SafeRegexOptions {
  // When true, the pattern is run even if it is deemed unsafe (fail-open). Use with care.
  allowUnsafe?: boolean;
}

export function safeRegexTest(
  pattern: any,
  flags: any,
  value: any,
  options: SafeRegexOptions = {}
): boolean {
  if (typeof value !== 'string' || typeof pattern !== 'string') return false;

  if (!options.allowUnsafe) {
    const resolvedFlags = typeof flags === 'string' ? flags : '';
    const analysis = analyzePattern(pattern, resolvedFlags);
    if (!analysis.safe) return false;
  }

  try {
    const resolvedFlags = typeof flags === 'string' ? flags : '';
    return getCachedRegExp(pattern, resolvedFlags).test(value);
  } catch {
    return false;
  }
}

export function clearRegexCache(): void {
  regexCache.clear();
}