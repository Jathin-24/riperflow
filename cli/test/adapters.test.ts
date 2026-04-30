import { describe, it, expect } from 'vitest';
import { createAdapter, ADAPTER_IDS } from '../src/adapters/base.js';

describe('adapter registry', () => {
  it('exposes ADAPTER_IDS as a non-empty list', () => {
    expect(Array.isArray(ADAPTER_IDS)).toBe(true);
    expect(ADAPTER_IDS.length).toBeGreaterThan(0);
  });

  it('returns an adapter instance for every registered id', async () => {
    for (const id of ADAPTER_IDS) {
      const a = await createAdapter(id, '/tmp/riper-test-fake');
      expect(a, `adapter for "${id}" should be non-null`).not.toBeNull();
      expect(typeof (a as any).install).toBe('function');
    }
  });

  it('returns null for unknown id', async () => {
    const a = await createAdapter('definitely-not-a-tool', '/tmp/riper-test-fake');
    expect(a).toBeNull();
  });

  it('routes the five previously-unreachable adapters', async () => {
    for (const id of ['cline', 'codex', 'aider', 'roo', 'windsurf']) {
      const a = await createAdapter(id, '/tmp/riper-test-fake');
      expect(a, `adapter for "${id}"`).not.toBeNull();
    }
  });
});
