import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { getWorkflowEngine } from '../src/core/workflow.js';
import { saveState, getDefaultState, saveConfig, getDefaultConfig } from '../src/config/loader.js';

describe('WorkflowEngine state freshness', () => {
  it('engine reads latest state.json on each call (no cross-process drift)', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-workflow-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      await saveConfig(getDefaultConfig());
      await saveState({ ...getDefaultState(), currentMode: 'research' });

      // First read: research
      const e1 = await getWorkflowEngine();
      expect(e1.getState().currentMode).toBe('research');

      // Simulate a separate process flipping the mode on disk.
      await saveState({ ...getDefaultState(), currentMode: 'execute' });

      // Second read: must see the latest value, not the cached 'research'.
      const e2 = await getWorkflowEngine();
      expect(e2.getState().currentMode).toBe('execute');
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });

  it('switchMode persists and the next engine read sees the new mode', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-workflow-switch-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      await saveConfig(getDefaultConfig());
      await saveState({ ...getDefaultState(), currentMode: 'research' });

      const e1 = await getWorkflowEngine();
      await e1.switchMode('plan');

      const e2 = await getWorkflowEngine();
      expect(e2.getState().currentMode).toBe('plan');
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });
});
