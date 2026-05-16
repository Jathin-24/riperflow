import chalk from 'chalk';
import { loadConfig, saveConfig } from '../config/loader.js';
import { createAdapter } from '../adapters/index.js';
import { trackAdapterInstall } from '../analytics/index.js';

interface SetupOptions {
  tools?: string;
  dryRun?: boolean;
  force?: boolean;
}

export async function setupCommand(options: SetupOptions): Promise<void> {
  const config = await loadConfig();
  
  if (!config) {
    console.log(chalk.red('❌ RIPER is not initialized. Run "riperflow init" first.'));
    process.exit(1);
  }

  // Determine which tools to setup
  let toolsToSetup: string[];
  
  if (options.tools) {
    toolsToSetup = options.tools.split(',').map(t => t.trim().toLowerCase());
  } else {
    toolsToSetup = Object.entries(config.tools)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name);
  }

  console.log(chalk.cyan.bold('\n🔧 Setting up RIPER adapters...\n'));

  if (options.dryRun) {
    console.log(chalk.yellow('⚠️  DRY RUN - No changes will be made\n'));
  }

  const results: Array<{ tool: string; success: boolean; message: string }> = [];

  for (const toolName of toolsToSetup) {
    const adapter = await createAdapter(toolName, config.projectPath);
    
    if (!adapter) {
      console.log(chalk.yellow(`  ⚠ ${toolName}: Adapter not available yet`));
      results.push({ tool: toolName, success: false, message: 'Adapter not available' });
      continue;
    }

    const isInstalled = await adapter.isInstalled();
    
    if (isInstalled && !options.force) {
      console.log(chalk.yellow(`  ⏭ ${toolName}: Already installed (use --force to reinstall)`));
      results.push({ tool: toolName, success: true, message: 'Already installed' });
      continue;
    }

    const result = await adapter.install(options.dryRun);
    
    if (result.success) {
      console.log(chalk.green(`  ✓ ${toolName}: ${result.message}`));
      if (result.filesCreated) {
        for (const file of result.filesCreated) {
          console.log(chalk.gray(`    - Created: ${file}`));
        }
      }
      if (!options.dryRun) {
        await trackAdapterInstall(toolName);
      }
    } else {
      console.log(chalk.red(`  ✗ ${toolName}: ${result.message}`));
    }
    
    results.push({
      tool: toolName,
      success: result.success,
      message: result.message
    });
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(chalk.bold('\n📊 Summary\n'));
  console.log(chalk.green(`  ✓ Successful: ${successful}`));
  if (failed > 0) {
    console.log(chalk.red(`  ✗ Failed: ${failed}`));
  }
  console.log('');
}
