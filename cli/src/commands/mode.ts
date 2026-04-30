import chalk from 'chalk';
import { loadConfig, loadState } from '../config/loader.js';
import { getWorkflowEngine, switchMode } from '../core/workflow.js';
import { MODES, getMode } from '../core/modes.js';
import { trackModeChange } from '../analytics/index.js';

export async function modeCommand(modeArg?: string): Promise<void> {
  const config = await loadConfig();
  
  if (!config) {
    console.log(chalk.red('❌ RIPER is not initialized. Run "riper-for-all init" first.'));
    process.exit(1);
  }

  const engine = await getWorkflowEngine();
  
  // If no mode specified, show current status
  if (!modeArg) {
    const state = engine.getState();
    const modeDef = MODES[state.currentMode];
    
    console.log(chalk.bold('\n📊 Current Status\n'));
    console.log(chalk.cyan(`Mode:   ${modeDef.emoji} ${modeDef.name} (${modeDef.symbol})`));
    console.log(chalk.cyan(`Phase:  ${state.currentPhase}`));
    console.log(chalk.cyan(`Since:  ${new Date(state.lastModeChange).toLocaleString()}`));
    
    console.log(chalk.bold('\n📋 Available Modes:\n'));
    for (const [key, mode] of Object.entries(MODES)) {
      const indicator = key === state.currentMode ? '●' : '○';
      console.log(`  ${indicator} ${mode.emoji} ${mode.symbol} ${mode.name.padEnd(12)} - ${mode.description}`);
    }
    
    console.log(chalk.bold('\n💡 Usage:\n'));
    console.log(chalk.gray('  riper-for-all mode research    # or /research'));
    console.log(chalk.gray('  riper-for-all mode innovate   # or /innovate'));
    console.log(chalk.gray('  riper-for-all mode plan       # or /plan'));
    console.log(chalk.gray('  riper-for-all mode execute    # or /execute'));
    console.log(chalk.gray('  riper-for-all mode review     # or /review'));
    console.log(chalk.gray('  riper-for-all mode            # show current status\n'));
    
    return;
  }

  // Validate mode
  const mode = modeArg.toLowerCase();
  const modeDef = getMode(mode);
  
  if (!modeDef) {
    console.log(chalk.red(`\n❌ Invalid mode: ${modeArg}\n`));
    console.log(chalk.gray('Valid modes: research, innovate, plan, execute, review'));
    console.log(chalk.gray('Shortcuts:   r, i, p, e, rev\n'));
    process.exit(1);
  }

  // Switch mode
  try {
    const state = await loadState();
    const fromMode = state?.currentMode || 'unknown';
    
    await switchMode(mode as any);
    await trackModeChange(fromMode, mode);
  } catch (error) {
    console.error(chalk.red('\n❌ Error switching mode:'), error);
    process.exit(1);
  }
}
