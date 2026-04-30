import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { getAnalyticsStorage } from '../src/analytics/storage.js';

describe('getAnalyticsStorage', () => {
  it('returns distinct instances for distinct projectPath args', async () => {
    const a = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-storage-a-'));
    const b = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-storage-b-'));
    try {
      const sA = getAnalyticsStorage(a);
      const sB = getAnalyticsStorage(b);
      expect(sA).not.toBe(sB);
      expect(sA.getFilePath()).toBe(path.join(a, '.riper', 'analytics.jsonl'));
      expect(sB.getFilePath()).toBe(path.join(b, '.riper', 'analytics.jsonl'));
    } finally {
      await fs.remove(a);
      await fs.remove(b);
    }
  });

  it('the same projectPath returns the same instance (cache works)', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-storage-cache-'));
    try {
      const s1 = getAnalyticsStorage(tmp);
      const s2 = getAnalyticsStorage(tmp);
      expect(s1).toBe(s2);
    } finally {
      await fs.remove(tmp);
    }
  });

  it('explicit path overrides a previously-cached cwd-based instance', async () => {
    const tmp1 = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-storage-cwd-'));
    const tmp2 = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-storage-explicit-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp1);
    try {
      const sCwd = getAnalyticsStorage();
      expect(sCwd.getFilePath()).toBe(path.join(tmp1, '.riper', 'analytics.jsonl'));

      const sExplicit = getAnalyticsStorage(tmp2);
      expect(sExplicit).not.toBe(sCwd);
      expect(sExplicit.getFilePath()).toBe(path.join(tmp2, '.riper', 'analytics.jsonl'));
    } finally {
      spy.mockRestore();
      await fs.remove(tmp1);
      await fs.remove(tmp2);
    }
  });
});
