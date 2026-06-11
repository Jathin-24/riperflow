import { describe, it, expect, beforeEach } from 'vitest';
import { detectTools, clearDetectToolsCache, getToolConfig, detectToolByName } from '../src/utils/detection.js';

describe('detectTools cache', () => {
  beforeEach(() => clearDetectToolsCache());

  it('returns the same array reference on subsequent calls within TTL', async () => {
    const a = await detectTools();
    const b = await detectTools();
    expect(b).toBe(a); // same reference proves cache hit
  });

  it('RIPER_FORCE_DETECT=1 bypasses the cache', async () => {
    const a = await detectTools();
    process.env.RIPER_FORCE_DETECT = '1';
    try {
      const b = await detectTools();
      expect(b).not.toBe(a);
    } finally {
      delete process.env.RIPER_FORCE_DETECT;
    }
  });

  it('clearDetectToolsCache resets the cache', async () => {
    const a = await detectTools();
    clearDetectToolsCache();
    const b = await detectTools();
    expect(b).not.toBe(a);
  });
});

describe('tool detection helpers', () => {
  it('normalizes tool names for getToolConfig', () => {
    expect(getToolConfig('claude-code')).toMatchObject({
      name: 'claudeCode',
      displayName: 'Claude Code'
    });
    expect(getToolConfig('claudecode')).toMatchObject({
      name: 'claudeCode',
      displayName: 'Claude Code'
    });
    expect(getToolConfig('cursor')).toMatchObject({
      name: 'cursor',
      displayName: 'Cursor'
    });
  });

  it('detectToolByName returns null for unknown tools', async () => {
    const tool = await detectToolByName('nonexistent-tool');
    expect(tool).toBeNull();
  });

  it('detectToolByName returns a DetectedTool object for known tools', async () => {
    const tool = await detectToolByName('cursor');
    expect(tool).not.toBeNull();
    expect(tool?.name).toBe('cursor');
    expect(typeof tool?.available).toBe('boolean');
  });
});
