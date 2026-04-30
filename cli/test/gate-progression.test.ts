import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { gateCommand } from '../src/commands/gate.js';
import { saveState, getDefaultState, saveConfig, getDefaultConfig, loadState } from '../src/config/loader.js';

async function setupProject(): Promise<string> {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-gate-progression-'));
  await fs.ensureDir(path.join(tmp, '.riper'));
  const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
  try {
    await saveConfig(getDefaultConfig());
    // Mode = execute so the enforce() write-check passes; gate progression
    // is the assertion we care about.
    await saveState({ ...getDefaultState(), currentMode: 'execute' });
  } finally {
    spy.mockRestore();
  }
  return tmp;
}

async function runWithExitGuard(fn: () => Promise<unknown>): Promise<{ exitCode: number | null; output: string }> {
  let exitCode: number | null = null;
  const origExit = process.exit;
  const lines: string[] = [];
  const origLog = console.log;
  process.exit = ((code?: number) => { exitCode = code ?? 0; throw new Error(`exit:${code}`); }) as any;
  console.log = (...args: any[]) => lines.push(args.join(' '));
  try {
    await fn().catch((e) => {
      if (!(e instanceof Error) || !e.message.startsWith('exit:')) throw e;
    });
  } finally {
    process.exit = origExit;
    console.log = origLog;
  }
  return { exitCode, output: lines.join('\n') };
}

describe('gate advance progression validation', () => {
  it('blocks advance from design without required approvals', async () => {
    const tmp = await setupProject();
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      const { exitCode, output } = await runWithExitGuard(() => gateCommand('advance'));
      expect(exitCode).toBe(1);
      expect(output).toMatch(/cannot.*advance|missing.*approval|blocker/i);
      // Disk state must NOT have advanced
      const state = await loadState();
      expect(state?.gateStatuses?.current ?? 'design').toBe('design');
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });

  it('allows advance once required approvals are recorded', async () => {
    const tmp = await setupProject();
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      // Pre-record the required approvals for the current (design) gate
      // so validateGateProgression sees no blockers.
      // Note: we omit gateStatuses.current so that enforce() skips the gate
      // check (no gate set in state), while advanceGate defaults to 'design'.
      const cur = await loadState();
      const required = ['po', 'architect']; // matches GATES.design.requiredApprovals
      const designStatus = {
        gate: 'design' as const,
        approved: true,
        approvers: required,
        timestamp: new Date().toISOString(),
      };
      await saveState({
        ...cur!,
        gateStatuses: { design: designStatus },
      });

      const { exitCode } = await runWithExitGuard(() => gateCommand('advance'));
      expect(exitCode).toBeNull(); // no exit was triggered
      const after = await loadState();
      expect(after?.gateStatuses?.current).toBe('development');
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });
});
