import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { autoBackupFile } from '../src/commands/backup.js';
import { saveConfig, getDefaultConfig } from '../src/config/loader.js';
import { restoreCommand } from '../src/commands/restore.js';

describe('autoBackupFile retention', () => {
  it('retains exactly config.backup.maxBackups files per source', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-maxbackups-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      const cfg = getDefaultConfig();
      cfg.backup.maxBackups = 3;
      await saveConfig(cfg);

      const source = path.join(tmp, '.riper', 'state.json');
      await fs.writeJson(source, { v: 0 });
      // Take 7 backups serially with a tiny pause so timestamps differ
      for (let i = 0; i < 7; i++) {
        await autoBackupFile(source, true);
        await new Promise(r => setTimeout(r, 10));
      }

      const backupsDir = path.join(tmp, '.riper', 'backups');
      const baks = (await fs.readdir(backupsDir)).filter(f => f.startsWith('state.json.') && f.endsWith('.bak'));
      expect(baks.length).toBe(3);
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });

  it('falls back to a sensible default when config is missing', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-maxbackups-default-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      const source = path.join(tmp, '.riper', 'state.json');
      await fs.writeJson(source, { v: 0 });
      // No config saved; loadConfig() returns null. cleanupOldBackups should
      // fall through to the schema default (10).
      for (let i = 0; i < 12; i++) {
        await autoBackupFile(source, true);
        await new Promise(r => setTimeout(r, 5));
      }

      const backupsDir = path.join(tmp, '.riper', 'backups');
      const baks = (await fs.readdir(backupsDir)).filter(f => f.startsWith('state.json.') && f.endsWith('.bak'));
      expect(baks.length).toBe(10);
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });
});

describe('restoreCommand', () => {
  it('re-creates a deleted file from its backup', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-restore-deleted-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      const cfg = getDefaultConfig();
      await saveConfig(cfg);

      // Take a backup of state.json, then delete the source.
      const stateFile = path.join(tmp, '.riper', 'state.json');
      await fs.writeJson(stateFile, { v: 'original' });
      await autoBackupFile(stateFile, true);
      await fs.unlink(stateFile);
      expect(await fs.pathExists(stateFile)).toBe(false);

      // Find the latest backup filename and restore it.
      const backupsDir = path.join(tmp, '.riper', 'backups');
      const baks = (await fs.readdir(backupsDir)).filter(f => f.startsWith('state.json.') && f.endsWith('.bak'));
      expect(baks.length).toBe(1);

      // restoreCommand calls process.exit on errors; capture it instead.
      const origExit = process.exit;
      process.exit = ((code?: number) => { throw new Error(`exit:${code}`); }) as any;
      try {
        await restoreCommand({ backup: baks[0] });
      } finally {
        process.exit = origExit;
      }

      expect(await fs.pathExists(stateFile)).toBe(true);
      const restored = await fs.readJson(stateFile);
      expect(restored.v).toBe('original');
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });

  it('infers memory-bank target by .md extension when both locations are empty', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-restore-md-'));
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    try {
      await fs.ensureDir(path.join(tmp, '.riper'));
      await fs.ensureDir(path.join(tmp, 'memory-bank'));
      await saveConfig(getDefaultConfig());

      // Backup of a memory bank file, then delete it.
      const mbFile = path.join(tmp, 'memory-bank', 'progress.md');
      await fs.writeFile(mbFile, '# original', 'utf-8');
      await autoBackupFile(mbFile, true);
      await fs.unlink(mbFile);

      const backupsDir = path.join(tmp, '.riper', 'backups');
      const baks = (await fs.readdir(backupsDir)).filter(f => f.startsWith('progress.md.') && f.endsWith('.bak'));
      expect(baks.length).toBe(1);

      const origExit = process.exit;
      process.exit = ((code?: number) => { throw new Error(`exit:${code}`); }) as any;
      try {
        await restoreCommand({ backup: baks[0] });
      } finally {
        process.exit = origExit;
      }

      expect(await fs.pathExists(mbFile)).toBe(true);
      const restored = await fs.readFile(mbFile, 'utf-8');
      expect(restored).toContain('original');
    } finally {
      spy.mockRestore();
      await fs.remove(tmp);
    }
  });
});
