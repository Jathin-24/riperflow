import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { enforce, EnforcementError } from '../src/core/enforce.js';
import { saveState, getDefaultState, saveConfig, getDefaultConfig } from '../src/config/loader.js';

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
