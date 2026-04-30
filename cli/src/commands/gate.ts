import chalk from 'chalk';
import { loadConfig, loadState, saveState } from '../config/loader.js';
import { GATES, GATE_ORDER, getGate, listGates, getNextGate, GateStage, GateStatus } from '../core/gates.js';

export async function gateCommand(action?: string, gateArg?: string): Promise<void> {
  const config = await loadConfig();
  
  if (!config) {
    console.log(chalk.red('❌ RIPER is not initialized. Run "riper-for-all init" first.'));
    process.exit(1);
  }

  const state = await loadState();
  const gateStatuses = (state as any)?.gateStatuses || {};

  if (!action) {
    showGateStatus(gateStatuses);
    return;
  }

  switch (action) {
    case 'list':
    case 'ls':
      listAllGates(gateStatuses);
      break;
    
    case 'status':
      showGateStatus(gateStatuses);
      break;
    
    case 'advance':
    case 'next':
      await advanceGate(gateStatuses, state);
      break;
    
    case 'approve':
      await approveGate(gateArg, gateStatuses, state);
      break;
    
    case 'reset':
      await resetGates(gateStatuses, state);
      break;
    
    default:
      console.log(chalk.red(`\n❌ Unknown action: ${action}\n`));
      console.log(chalk.gray('Valid actions: list, status, advance, approve, reset\n'));
      process.exit(1);
  }
}

function showGateStatus(gateStatuses: Record<string, GateStatus>): void {
  console.log(chalk.bold('\n🚪 Quality Gates\n'));
  
  const currentGate = (gateStatuses as any)?.current || 'design';
  
  for (const gateId of GATE_ORDER) {
    const gate = GATES[gateId];
    const status = gateStatuses[gateId];
    const isCurrent = gateId === currentGate;
    
    let indicator = '○';
    let color = chalk.gray;
    
    if (status?.approved) {
      indicator = '✓';
      color = chalk.green;
    } else if (isCurrent) {
      indicator = '▶';
      color = chalk.cyan;
    }
    
    console.log(`  ${color(indicator)} ${gate.emoji} ${gate.name.padEnd(16)} ${isCurrent ? chalk.cyan('(current)') : ''}`);
    
    if (status?.approved && status.timestamp) {
      console.log(chalk.gray(`      Approved: ${new Date(status.timestamp).toLocaleString()}`));
    }
  }
  
  console.log(chalk.bold('\n💡 Usage:\n'));
  console.log(chalk.gray('  riper-for-all gate             # Show status'));
  console.log(chalk.gray('  riper-for-all gate list       # List all gates'));
  console.log(chalk.gray('  riper-for-all gate advance    # Move to next gate'));
  console.log(chalk.gray('  riper-for-all gate approve <gate> # Approve a gate'));
  console.log(chalk.gray('  riper-for-all gate reset      # Reset all gates\n'));
}

function listAllGates(gateStatuses: Record<string, GateStatus>): void {
  const gates = listGates();
  
  console.log(chalk.bold('\n🚪 Quality Gates\n'));
  
  for (const gate of gates) {
    const status = gateStatuses[gate.id];
    const approved = status?.approved ? chalk.green('✓ Approved') : chalk.yellow('○ Pending');
    
    console.log(`\n  ${gate.emoji} ${gate.name} (${gate.symbol})`);
    console.log(chalk.gray(`    ${gate.description}`));
    console.log(chalk.gray(`    Required: ${gate.requiredApprovals.join(', ')}`));
    console.log(`    Status: ${approved}`);
  }
  console.log('');
}

async function advanceGate(gateStatuses: Record<string, GateStatus>, state: any): Promise<void> {
  const currentGate = ((gateStatuses.current as unknown) as GateStage) || 'design';
  const nextGate = getNextGate(currentGate);
  
  if (!nextGate) {
    console.log(chalk.yellow('\n⚠ Already at final gate!\n'));
    return;
  }
  
  (gateStatuses as any).current = nextGate;
  
  if (!state) {
    state = { 
      currentRole: 'dev', 
      session: { startTime: new Date().toISOString(), modeHistory: [] },
      gateStatuses 
    };
  }
  
  state.gateStatuses = gateStatuses;
  await saveState(state);
  
  const gate = GATES[nextGate];
  console.log(chalk.green(`\n✓ Advanced to ${gate.emoji} ${gate.name}\n`));
}

async function approveGate(gateId: string | undefined, gateStatuses: Record<string, GateStatus>, state: any): Promise<void> {
  if (!gateId) {
    console.log(chalk.red('❌ Please specify a gate to approve.'));
    console.log(chalk.gray('Usage: riper-for-all gate approve <gate>\n'));
    process.exit(1);
  }
  
  const gate = getGate(gateId);
  if (!gate) {
    console.log(chalk.red(`\n❌ Unknown gate: ${gateId}\n`));
    console.log(chalk.gray('Valid gates: design, development, testing, review, deploy\n'));
    process.exit(1);
  }
  
  if (!gateStatuses[gateId]) {
    gateStatuses[gateId] = {
      gate: gateId as GateStage,
      approved: false,
      approvers: [],
      timestamp: null
    };
  }
  
  gateStatuses[gateId].approved = true;
  gateStatuses[gateId].timestamp = new Date().toISOString();
  gateStatuses[gateId].approvers.push('current-user');
  
  if (!state) {
    state = { 
      currentRole: 'dev', 
      session: { startTime: new Date().toISOString(), modeHistory: [] },
      gateStatuses 
    };
  }
  
  state.gateStatuses = gateStatuses;
  await saveState(state);
  
  console.log(chalk.green(`\n✓ Approved ${gate.emoji} ${gate.name}\n`));
}

async function resetGates(gateStatuses: Record<string, GateStatus>, state: any): Promise<void> {
  gateStatuses = { current: 'design' } as any;
  
  if (!state) {
    state = { 
      currentRole: 'dev', 
      session: { startTime: new Date().toISOString(), modeHistory: [] },
      gateStatuses 
    };
  }
  
  state.gateStatuses = gateStatuses;
  await saveState(state);
  
  console.log(chalk.green('\n✓ All gates reset to design\n'));
}
