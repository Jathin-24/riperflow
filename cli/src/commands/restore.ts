import chalk from 'chalk';
import { loadConfig } from '../config/loader.js';
import { getRiperDir, getMemoryBankDir } from '../config/loader.js';
import fs from 'fs-extra';
import path from 'path';
import { autoBackupFile } from './backup.js';

export async function restoreCommand(options: any): Promise<void> {
  const config = await loadConfig();
  
  if (!config) {
    console.log(chalk.red('❌ RIPER is not initialized.'));
    process.exit(1);
  }

  const backupFile = options.backup;
  
  if (!backupFile) {
    console.log(chalk.yellow('\n⚠️  Usage: riper-for-all restore -b <backup-file>'));
    console.log(chalk.gray('\nExamples:'));
    console.log(chalk.gray('  riper-for-all restore -b state.json.2026-03-14T10-30-00.bak'));
    console.log(chalk.gray('  riper-for-all restore -b progress.md.2026-03-14T10-30-00.bak'));
    console.log(chalk.gray('\n💡 List backups: riper-for-all backup --list\n'));
    process.exit(1);
  }

  const backupsDir = path.join(getRiperDir(), 'backups');
  
  if (!(await fs.pathExists(backupsDir))) {
    console.log(chalk.red('❌ No backups found.'));
    process.exit(1);
  }

  const backupPath = path.join(backupsDir, backupFile);
  
  if (!(await fs.pathExists(backupPath))) {
    console.log(chalk.red(`❌ Backup not found: ${backupFile}`));
    console.log(chalk.gray('\n💡 List backups: riper-for-all backup --list\n'));
    process.exit(1);
  }

  // Extract original filename from backup name
  // Format: originalfilename.timestamp.bak (e.g., state.json.2026-03-14T13-44-17-914Z.bak)
  // Strategy: remove the .timestamp.bak suffix to get original filename
  const parts = backupFile.split('.');
  // Find where the timestamp starts: after the original filename
  // state.json.2026-03-14T13-44-17-914Z.bak -> parts = ['state', 'json', '2026-03-14T13-44-17-914Z', 'bak']
  // We want: state.json
  if (parts.length >= 3 && parts[parts.length - 1] === 'bak') {
    parts.pop(); // Remove 'bak'
    parts.pop(); // Remove timestamp part like '2026-03-14T13-44-17-914Z'
  }
  const originalFilename = parts.join('.');
  
  // Determine restore location:
  // 1. If a current copy exists in memory-bank/, restore there.
  // 2. If a current copy exists in .riper/, restore there.
  // 3. Otherwise infer from extension: .md -> memory-bank/, anything else -> .riper/.
  const memoryBankDir = getMemoryBankDir();
  const riperDir = getRiperDir();
  let restorePath: string;
  const memoryBankCandidate = path.join(memoryBankDir, originalFilename);
  const riperCandidate = path.join(riperDir, originalFilename);

  if (await fs.pathExists(memoryBankCandidate)) {
    restorePath = memoryBankCandidate;
  } else if (await fs.pathExists(riperCandidate)) {
    restorePath = riperCandidate;
  } else {
    // File was deleted; pick a sensible target by extension.
    restorePath = originalFilename.endsWith('.md')
      ? memoryBankCandidate
      : riperCandidate;
    console.log(chalk.gray(`  (target file did not exist; will create at ${restorePath})`));
  }

  const targetExists = await fs.pathExists(restorePath);
  console.log(chalk.cyan(`\n🔄 Restoring ${originalFilename}...`));

  // Only auto-backup if there's something to back up.
  if (targetExists) {
    await autoBackupFile(restorePath, true);
  }

  // Ensure parent dir exists (covers the deleted-target case)
  await fs.ensureDir(path.dirname(restorePath));
  await fs.copy(backupPath, restorePath, { overwrite: true });

  console.log(chalk.green(`\n✅ Restored: ${originalFilename}`));
  console.log(chalk.gray(`   From backup: ${backupFile}\n`));
  if (targetExists) {
    console.log(chalk.gray(`💡 Previous file backed up before restore\n`));
  } else {
    console.log(chalk.gray(`💡 File was missing; restored from backup\n`));
  }
}
