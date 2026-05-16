import chalk from 'chalk';
import { loadConfig, loadState } from '../config/loader.js';
import { MEMORY_FILES, MODES, PHASES } from '../core/modes.js';

export async function statusCommand(): Promise<void> {
  const config = await loadConfig();
  const state = await loadState();

  console.log(chalk.bold('\n📊 Riperflow Status\n'));

  if (!config || !state) {
    console.log(chalk.yellow('⚠ RIPER is not initialized.\n'));
    console.log(chalk.gray('Run "riperflow init" to get started.\n'));
    return;
  }

  console.log(chalk.cyan('Project: '), config.projectName);
  console.log(chalk.cyan('Path:    '), config.projectPath);

  const mode = MODES[state.currentMode];
  const phase = PHASES[state.currentPhase];

  console.log(chalk.bold('\n📍 Current State\n'));
  console.log(chalk.cyan('Mode:   '), `${mode.emoji} ${mode.name} (${mode.symbol})`);
  console.log(chalk.cyan('Phase:  '), `${phase.emoji} ${phase.name}`);
  console.log(chalk.cyan('Since:  '), new Date(state.lastModeChange).toLocaleString());

  console.log(chalk.bold('\n🔧 Configured Tools\n'));
  const enabledTools = Object.entries(config.tools)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
  
  if (enabledTools.length === 0) {
    console.log(chalk.yellow('  No tools configured'));
  } else {
    for (const tool of enabledTools) {
      console.log(chalk.green('  ✓'), tool);
    }
  }

  console.log(chalk.bold('\n📋 Memory Bank\n'));
  for (const [key, file] of Object.entries(MEMORY_FILES)) {
    console.log(chalk.gray(`  ${file.emoji} ${file.filename}`));
  }

  console.log(chalk.bold('\n📈 Session Stats\n'));
  console.log(chalk.cyan('Started: '), new Date(state.session.startTime).toLocaleString());
  console.log(chalk.cyan('Mode changes: '), state.session.modeHistory.length);

  console.log('');
}
