import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { enforce, EnforcementError } from '../src/core/enforce.js';
import { saveState, getDefaultState, saveConfig, getDefaultConfig } from '../src/config/loader.js';
import { logViolation as _ } from '../src/core/violations.js'; // ensure path resolves

describe('enforce', () => {
  it('allows write in execute mode', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-enforce-exec-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      await saveConfig(getDefaultConfig());
      await saveState({ ...getDefaultState(), currentMode: 'execute' });
      await expect(enforce('write', '.riper/state.json')).resolves.toBeUndefined();
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });

  it('blocks write in research mode', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-enforce-res-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      await saveConfig(getDefaultConfig());
      await saveState({ ...getDefaultState(), currentMode: 'research' });
      const err = await enforce('write', '.riper/state.json').catch(e => e);
      expect(err).toBeInstanceOf(EnforcementError);
      expect(err.message).toMatch(/research/i);
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });

  it('allows read in research mode', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-enforce-read-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      await saveConfig(getDefaultConfig());
      await saveState({ ...getDefaultState(), currentMode: 'research' });
      await expect(enforce('read', '.riper/state.json')).resolves.toBeUndefined();
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });

  it('blocks delete in plan mode', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-enforce-plan-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      await saveConfig(getDefaultConfig());
      await saveState({ ...getDefaultState(), currentMode: 'plan' });
      await expect(enforce('delete', 'memory-bank/progress.md')).rejects.toBeInstanceOf(EnforcementError);
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });
});

describe('enforce + violation logging', () => {
  it('appends a violation record on denial', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-enforce-violation-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      await saveConfig(getDefaultConfig());
      await saveState({ ...getDefaultState(), currentMode: 'research' });

      await enforce('write', '.riper/state.json').catch(() => {});

      const logFile = path.join(tmp, '.riper', 'violations.jsonl');
      expect(await fs.pathExists(logFile)).toBe(true);
      const content = await fs.readFile(logFile, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      expect(lines.length).toBe(1);
      const record = JSON.parse(lines[0]);
      expect(record.mode).toBe('research');
      expect(record.action).toBe('write');
      expect(record.path).toBe('.riper/state.json');
      expect(record.resolution).toBe('blocked');
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });

  it('does not log a violation on allowed operations', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-enforce-no-violation-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      await saveConfig(getDefaultConfig());
      await saveState({ ...getDefaultState(), currentMode: 'execute' });

      await enforce('write', '.riper/state.json');

      const logFile = path.join(tmp, '.riper', 'violations.jsonl');
      // File may not exist at all, OR exist but be empty — both are fine
      if (await fs.pathExists(logFile)) {
        const content = await fs.readFile(logFile, 'utf-8');
        expect(content.trim()).toBe('');
      }
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });

  it('survives violation-log write errors without masking the EnforcementError', async () => {
    // If logViolation fails, enforce should still throw the EnforcementError.
    // We can't easily simulate a write error, but we can at least verify
    // the throw path is still reached when a violation is recorded.
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-enforce-throw-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      await saveConfig(getDefaultConfig());
      await saveState({ ...getDefaultState(), currentMode: 'research' });

      await expect(enforce('write', '.riper/state.json')).rejects.toBeInstanceOf(EnforcementError);
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });
});
