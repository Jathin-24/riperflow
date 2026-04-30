import chalk from 'chalk';
import { loadConfig } from '../config/loader.js';
import { getAnalyticsStorage } from '../analytics/index.js';

export interface AnalyticsOptions {
  export?: boolean;
  format?: string;
  limit?: number;
  since?: string;
}

export async function analyticsCommand(options: AnalyticsOptions): Promise<void> {
  const config = await loadConfig();
  
  if (!config) {
    console.log(chalk.red('❌ RIPER is not initialized.'));
    process.exit(1);
  }

  const storage = getAnalyticsStorage(config.projectPath);

  if (options.export) {
    console.log(chalk.cyan('\n📊 Exporting analytics...\n'));
    
    const events = await storage.read(options.limit || 100, options.since);
    
    if (events.length === 0) {
      console.log(chalk.yellow('  No analytics data available yet.'));
      console.log(chalk.gray('  Analytics will be collected as you use RIPER.\n'));
      return;
    }
    
    const exportPath = storage.getFilePath();
    console.log(chalk.green(`✓ Exported ${events.length} events from:`));
    console.log(chalk.gray(`  ${exportPath}\n`));
    return;
  }

  console.log(chalk.bold('\n📊 Analytics Summary\n'));
  
  const stats = await storage.getStats();
  
  if (stats.totalEvents === 0) {
    console.log(chalk.yellow('  No analytics data yet.\n'));
    console.log(chalk.gray('  Start using RIPER to collect usage data.\n'));
    return;
  }

  console.log(chalk.bold('  Overview\n'));
  console.log(`  ${chalk.cyan('Total Events:')}    ${stats.totalEvents}`);
  console.log(`  ${chalk.cyan('First Event:')}    ${stats.firstEvent ? new Date(stats.firstEvent).toLocaleString() : 'N/A'}`);
  console.log(`  ${chalk.cyan('Last Event:')}     ${stats.lastEvent ? new Date(stats.lastEvent).toLocaleString() : 'N/A'}`);

  console.log(chalk.bold('\n  Mode Changes\n'));
  console.log(`  ${stats.modeChanges} mode switches`);

  if (stats.modeChanges > 0) {
    const modeHistory = await storage.getModeHistory();
    for (const mode of modeHistory) {
      console.log(`    ${chalk.gray('•')} ${mode.mode}: ${mode.count}`);
    }
  }

  console.log(chalk.bold('\n  Commands\n'));
  console.log(`  ${stats.commandsRun} commands executed`);
  
  if (stats.commandsRun > 0) {
    const commandUsage = await storage.getCommandUsage();
    for (const cmd of commandUsage.sort((a, b) => b.count - a.count).slice(0, 5)) {
      console.log(`    ${chalk.gray('•')} ${cmd.command}: ${cmd.count}`);
    }
  }

  console.log(chalk.bold('\n  Adapters\n'));
  console.log(`  ${stats.adaptersInstalled} installations`);

  console.log(chalk.bold('\n  MCP\n'));
  console.log(`  ${stats.mcpActions} MCP actions`);

  console.log(chalk.gray('\n  💡 Use --export to export full data\n'));
}
