import chalk from 'chalk';
import { loadConfig, saveConfig, resetConfig } from '../config/loader.js';

export async function configCommand(action?: string, keyArg?: string, valueArg?: string): Promise<void> {
  if (!action) {
    // Show all config
    const config = await loadConfig();
    
    if (!config) {
      console.log(chalk.red('❌ RIPER is not initialized.'));
      process.exit(1);
    }

    console.log(chalk.bold('\n⚙️  Configuration\n'));
    console.log(chalk.cyan('Project: '), config.projectName);
    console.log(chalk.cyan('Version: '), config.version);
    
    console.log(chalk.bold('\n🔧 Tools\n'));
    for (const [name, enabled] of Object.entries(config.tools)) {
      console.log(`  ${enabled ? chalk.green('✓') : chalk.gray('○')} ${name}`);
    }

    console.log(chalk.bold('\n📡 Telemetry\n'));
    console.log(chalk.cyan('Enabled: '), config.telemetry.enabled ? 'Yes' : 'No');
    console.log(chalk.cyan('Anonymous: '), config.telemetry.anonymous ? 'Yes' : 'No');

    console.log(chalk.bold('\n💾 Backup\n'));
    console.log(chalk.cyan('Auto: '), config.backup.auto ? 'Yes' : 'No');
    console.log(chalk.cyan('Interval: '), config.backup.interval);
    console.log(chalk.cyan('Max: '), config.backup.maxBackups);

    console.log('');
    return;
  }

  const config = await loadConfig();
  
  if (!config && action !== 'reset') {
    console.log(chalk.red('❌ RIPER is not initialized.'));
    process.exit(1);
  }

  switch (action) {
    case 'get': {
      if (!keyArg) {
        console.log(chalk.red('❌ Please specify a key to get.'));
        process.exit(1);
      }
      const gotValue = getNestedValue(config!, keyArg);
      console.log(chalk.cyan(`${keyArg}: `), gotValue || '(not set)');
      break;
    }
    
    case 'set': {
      if (!keyArg || valueArg === undefined) {
        console.log(chalk.red('❌ Please specify key and value.'));
        console.log(chalk.gray('Usage: riper-for-all config set <key> <value>\n'));
        process.exit(1);
      }
      setNestedValue(config!, keyArg, valueArg);
      await saveConfig(config!);
      console.log(chalk.green(`\n✓ Set ${keyArg} = ${valueArg}\n`));
      break;
    }
    
    case 'reset':
      await resetConfig();
      console.log(chalk.green('\n✓ Config reset to defaults\n'));
      break;
    
    default:
      console.log(chalk.red(`\n❌ Unknown action: ${action}\n`));
      console.log(chalk.gray('Valid actions: get, set, reset\n'));
      process.exit(1);
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  const last = parts.pop()!;
  const target = parts.reduce((acc, part) => {
    if (!acc[part]) acc[part] = {};
    return acc[part];
  }, obj);
  target[last] = value;
}
