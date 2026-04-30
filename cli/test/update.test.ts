import { describe, it, expect } from 'vitest';
import { compareSemver } from '../src/commands/update.js';

describe('compareSemver', () => {
  it.each([
    ['1.0.0', '1.0.0', 0],
    ['1.0.1', '1.0.0', 1],
    ['1.0.0', '1.0.1', -1],
    ['1.10.0', '1.9.0', 1], // numeric, not lexical
    ['2.0.0', '1.99.99', 1],
    ['v1.2.3', '1.2.3', 0], // optional v prefix tolerated
    ['1.2.3-beta', '1.2.3', 0], // pre-release suffix ignored
    ['12.9.0', '9.4.0', 1], // the better-sqlite3 case the audit hit
  ])('compareSemver(%s, %s) sign matches %i', (a, b, expected) => {
    const got = compareSemver(a, b);
    if (expected === 0) expect(got).toBe(0);
    else if (expected > 0) expect(got).toBeGreaterThan(0);
    else expect(got).toBeLessThan(0);
  });
});
