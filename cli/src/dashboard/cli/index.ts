import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { loadConfig, loadState } from '../../config/loader.js';
import { MODES } from '../../core/modes.js';
import { ROLES } from '../../core/roles.js';
import { GATES } from '../../core/gates.js';
import { ViolationLogger } from '../../core/violations.js';
import { MCPManager } from '../../mcp/manager.js';

export interface TerminalDashboardOptions {
  projectPath: string;
  refreshInterval?: number;
}

export class TerminalDashboard {
  private projectPath: string;
  private violationLogger: ViolationLogger;
  private mcpManager: MCPManager;

  constructor(options: TerminalDashboardOptions) {
    this.projectPath = options.projectPath;
    this.violationLogger = new ViolationLogger(this.projectPath, { consoleOutput: false });
    this.mcpManager = new MCPManager({ projectPath: this.projectPath });
  }

  /**
   * Render the complete dashboard
   */
  async render(): Promise<string> {
    const config = await loadConfig();
    const state = await loadState();
    const violations = await this.violationLogger.getStats();
    const mcpStatus = await this.mcpManager.getSystemStatus();

    const lines: string[] = [];

    // Header
    lines.push(this.renderHeader());
    lines.push('');

    if (!config || !state) {
      lines.push(chalk.yellow('⚠ RIPER not initialized. Run: riper init'));
      return lines.join('\n');
    }

    // BMAD Status Box
    lines.push(this.renderBMADStatus(state));
    lines.push('');

    // Mode Information
    lines.push(this.renderModeInfo(state.currentMode));
    lines.push('');

    // Gate Status
    lines.push(this.renderGateStatus((state as any).currentGate || 'design'));
    lines.push('');

    // Role Information  
    lines.push(this.renderRoleInfo((state as any).currentRole || 'developer'));
    lines.push('');

    // Violations Summary
    lines.push(this.renderViolations(violations));
    lines.push('');

    // MCP Status
    lines.push(this.renderMCPStatus(mcpStatus));
    lines.push('');

    // Quick Actions
    lines.push(this.renderQuickActions());

    return lines.join('\n');
  }

  private renderHeader(): string {
    const now = new Date().toLocaleString();
    return chalk.bold.cyan(
      '┌─────────────────────────────────────────────────────────┐\n' +
      '│              RIPER-for-All Dashboard                     │\n' +
      '│         ' + chalk.gray(now.padEnd(45)) + '│\n' +
      '└─────────────────────────────────────────────────────────┘'
    );
  }

  private renderBMADStatus(state: any): string {
    const mode = MODES[state.currentMode as keyof typeof MODES];
    const role = state.currentRole ? ROLES[state.currentRole as keyof typeof ROLES] : undefined;
    const gate = state.currentGate ? GATES[state.currentGate as keyof typeof GATES] : GATES['design'];

    const modeStr = mode 
      ? `${mode.symbol} ${mode.emoji} ${chalk.bold(mode.name)}` 
      : chalk.gray('Unknown');
    
    const roleStr = role 
      ? `${role.symbol} ${role.emoji} ${chalk.bold(role.name)}` 
      : chalk.gray('Unknown');
    
    const gateStr = gate 
      ? `${gate.symbol} ${gate.emoji} ${chalk.bold(gate.name)}` 
      : chalk.gray('Unknown');

    return chalk.white(
      '┌─ BMAD Status ─────────────────────────────────────────┐\n' +
      `│ Mode:  ${modeStr.padEnd(45)}│\n` +
      `│ Role:  ${roleStr.padEnd(45)}│\n` +
      `│ Gate:  ${gateStr.padEnd(45)}│\n` +
      '└────────────────────────────────────────────────────────┘'
    );
  }

  private renderModeInfo(modeId: string): string {
    const mode = MODES[modeId as keyof typeof MODES];
    if (!mode) return chalk.gray('Mode information unavailable');

    const perms = mode.permissions;
    const permStr = [
      perms.read ? chalk.green('✓ Read') : chalk.red('✗ Read'),
      perms.create ? chalk.green('✓ Create') : chalk.red('✗ Create'),
      perms.update ? chalk.green('✓ Update') : chalk.red('✗ Update'),
      perms.delete ? chalk.green('✓ Delete') : chalk.red('✗ Delete')
    ].join(' | ');

    return chalk.white(
      '┌─ Mode: ' + chalk.bold(mode.name) + ' ──────────────────────────────────────┐\n' +
      `│ ${mode.symbol} ${mode.emoji} ${mode.description.padEnd(45)}│\n` +
      `│ Permissions: ${permStr.padEnd(37)}│\n` +
      '└────────────────────────────────────────────────────────┘'
    );
  }

  private renderGateStatus(gateId: string): string {
    const gate = GATES[gateId as keyof typeof GATES];
    if (!gate) return chalk.gray('Gate information unavailable');

    const approvals = gate.requiredApprovals.length > 0
      ? gate.requiredApprovals.join(', ')
      : 'None required';

    return chalk.white(
      '┌─ Gate: ' + chalk.bold(gate.name) + ' ───────────────────────────────────┐\n' +
      `│ ${gate.symbol} ${gate.emoji} ${gate.description.padEnd(45)}│\n` +
      `│ Required Approvals: ${chalk.yellow(approvals).padEnd(29)}│\n` +
      '└────────────────────────────────────────────────────────┘'
    );
  }

  private renderRoleInfo(roleId: string): string {
    const role = ROLES[roleId as keyof typeof ROLES];
    if (!role) return chalk.gray('Role information unavailable');

    const perms = role?.permissions;
    const capStr = perms ? [
      perms.read ? chalk.green('Read') : chalk.gray('Read'),
      perms.write ? chalk.green('Write') : chalk.gray('Write'),
      perms.delete ? chalk.green('Delete') : chalk.gray('Delete'),
      perms.deploy ? chalk.green('Deploy') : chalk.gray('Deploy'),
      perms.approve ? chalk.green('Approve') : chalk.gray('Approve')
    ].join(' | ') : chalk.gray('No permissions');

    return chalk.white(
      '┌─ Role: ' + chalk.bold(role.name) + ' ────────────────────────────────────┐\n' +
      `│ ${role.symbol} ${role.emoji} ${role.description.padEnd(45)}│\n` +
      `│ Capabilities: ${capStr.padEnd(34)}│\n` +
      '└────────────────────────────────────────────────────────┘'
    );
  }

  private renderViolations(stats: any): string {
    const total = stats.total || 0;
    const bySeverity = stats.bySeverity || {};

    let color = chalk.green;
    if (bySeverity.critical > 0) color = chalk.bgRed.white;
    else if (bySeverity.error > 0) color = chalk.red;
    else if (bySeverity.warn > 0) color = chalk.yellow;

    const severityStr = [
      bySeverity.critical ? chalk.red(`${bySeverity.critical} critical`) : '',
      bySeverity.error ? chalk.red(`${bySeverity.error} errors`) : '',
      bySeverity.warn ? chalk.yellow(`${bySeverity.warn} warnings`) : '',
      bySeverity.info ? chalk.blue(`${bySeverity.info} info`) : ''
    ].filter(Boolean).join(', ') || chalk.green('None');

    return color(
      '┌─ Violations ──────────────────────────────────────────┐\n' +
      `│ Total: ${String(total).padEnd(48)}│\n` +
      `│ By Severity: ${severityStr.padEnd(41)}│\n` +
      '└────────────────────────────────────────────────────────┘'
    );
  }

  private renderMCPStatus(status: any): string {
    const installed = status.installedServers || [];
    const missing = status.missingServers || [];
    const envIssues = status.envIssues || [];

    const statusColor = installed.length > 0 ? chalk.green : chalk.yellow;
    const installedStr = installed.length > 0 
      ? installed.join(', ') 
      : 'None installed';
    
    const issueStr = envIssues.length > 0
      ? chalk.yellow(`${envIssues.length} env issues`)
      : chalk.green('No issues');

    return statusColor(
      '┌─ MCP Servers ─────────────────────────────────────────┐\n' +
      `│ Installed (${installed.length}): ${installedStr.slice(0, 38).padEnd(38)}│\n` +
      `│ Environment: ${issueStr.padEnd(39)}│\n` +
      '└────────────────────────────────────────────────────────┘'
    );
  }

  private renderQuickActions(): string {
    return chalk.gray(
      'Commands:\n' +
      '  riper mode <mode>     - Switch mode\n' +
      '  riper role <role>     - Switch role\n' +
      '  riper gate next       - Advance gate\n' +
      '  riper status          - Show status\n' +
      '  riper dashboard web   - Open web dashboard'
    );
  }

  /**
   * Run interactive mode with keyboard controls
   */
  async runInteractive(): Promise<void> {
    console.clear();
    console.log(await this.render());
    
    console.log(chalk.gray('\nPress Ctrl+C to exit, or run commands in another terminal.\n'));
    
    // Simple refresh loop
    const refresh = async () => {
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.clear();
        console.log(await this.render());
        console.log(chalk.gray('\nPress Ctrl+C to exit, or run commands in another terminal.\n'));
      }
    };

    try {
      await refresh();
    } catch {
      // Exit gracefully
    }
  }
}

/**
 * Display dashboard once
 */
export async function showDashboard(projectPath: string): Promise<void> {
  const dashboard = new TerminalDashboard({ projectPath });
  console.log(await dashboard.render());
}

/**
 * Run interactive dashboard
 */
export async function runInteractiveDashboard(projectPath: string): Promise<void> {
  const dashboard = new TerminalDashboard({ projectPath });
  await dashboard.runInteractive();
}
