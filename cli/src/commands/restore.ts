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
  
  // Determine restore location
  const memoryBankDir = getMemoryBankDir();
  const riperDir = getRiperDir();
  
  let restorePath = path.join(memoryBankDir, originalFilename);
  
  // Check if file exists in memory-bank, otherwise try .riper
  if (!(await fs.pathExists(restorePath))) {
    restorePath = path.join(riperDir, originalFilename);
  }

  if (!(await fs.pathExists(restorePath))) {
    console.log(chalk.red(`❌ Original file not found: ${originalFilename}`));
    console.log(chalk.gray('\n💡 List backups: riper-for-all backup --list\n'));
    process.exit(1);
  }

  // Backup current file before restoring
  console.log(chalk.cyan(`\n🔄 Restoring ${originalFilename}...`));
  await autoBackupFile(restorePath, true);
  
  // Restore
  await fs.copy(backupPath, restorePath, { overwrite: true });

  console.log(chalk.green(`\n✅ Restored: ${originalFilename}`));
  console.log(chalk.gray(`   From backup: ${backupFile}\n`));
  console.log(chalk.gray(`💡 Current file has been backed up before restore\n`));
}
