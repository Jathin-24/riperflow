import chalk from 'chalk';
import { loadConfig, loadState, saveState } from '../config/loader.js';
import { ROLES, getRole, listRoles, Role } from '../core/roles.js';
import { getAnalyticsStorage, trackEvent } from '../analytics/index.js';

export async function roleCommand(action?: string, roleArg?: string): Promise<void> {
  const config = await loadConfig();
  
  if (!config) {
    console.log(chalk.red('❌ RIPER is not initialized. Run "riper-for-all init" first.'));
    process.exit(1);
  }

  const state = await loadState();
  const currentRole = (state as any)?.currentRole || 'dev';

  if (!action) {
    showRoleStatus(currentRole);
    return;
  }

  switch (action) {
    case 'list':
    case 'ls':
      listAllRoles(currentRole);
      break;
    
    case 'set':
    case 'switch':
      if (!roleArg) {
        console.log(chalk.red('❌ Please specify a role.'));
        console.log(chalk.gray('Usage: riper-for-all role set <role>\n'));
        process.exit(1);
      }
      await switchRole(roleArg, currentRole, state);
      break;
    
    case 'info':
      showRoleInfo(roleArg || currentRole);
      break;
    
    case 'permissions':
    case 'perms':
      showRolePermissions(roleArg || currentRole);
      break;
    
    default:
      console.log(chalk.red(`\n❌ Unknown action: ${action}\n`));
      console.log(chalk.gray('Valid actions: list, set, info, permissions\n'));
      process.exit(1);
  }
}

function showRoleStatus(currentRole: string): void {
  const role = getRole(currentRole);
  
  console.log(chalk.bold('\n👤 Current Role\n'));
  if (role) {
    console.log(`  ${role.emoji} ${role.name} (${role.symbol})`);
    console.log(chalk.gray(`  ${role.description}\n`));
  } else {
    console.log(chalk.yellow(`  Unknown role: ${currentRole}\n`));
  }
  
  console.log(chalk.bold('💡 Usage:\n'));
  console.log(chalk.gray('  riper-for-all role              # Show current role'));
  console.log(chalk.gray('  riper-for-all role list        # List all roles'));
  console.log(chalk.gray('  riper-for-all role set <role>  # Switch role'));
  console.log(chalk.gray('  riper-for-all role info        # Role details'));
  console.log(chalk.gray('  riper-for-all role permissions # Show permissions\n'));
}

function listAllRoles(currentRole: string): void {
  const roles = listRoles();
  
  console.log(chalk.bold('\n👥 Available Roles\n'));
  
  for (const role of roles) {
    const isCurrent = role.id === currentRole;
    const indicator = isCurrent ? '●' : '○';
    console.log(`  ${indicator} ${role.emoji} ${role.symbol} ${role.name.padEnd(12)} - ${role.description}`);
  }
  
  console.log('');
}

async function switchRole(newRole: string, currentRole: string, state: any): Promise<void> {
  const role = getRole(newRole);
  
  if (!role) {
    console.log(chalk.red(`\n❌ Unknown role: ${newRole}\n`));
    console.log(chalk.gray('Valid roles: po, architect, dev, qa, devops\n'));
    process.exit(1);
  }

  if (!state) {
    state = { currentRole: 'dev', session: { startTime: new Date().toISOString(), modeHistory: [] } };
  }
  
  state.currentRole = newRole;
  await saveState(state);
  
  console.log(chalk.green(`\n✓ Switched from ${ROLES[currentRole as Role]?.name || currentRole} to ${role.name}\n`));
  
  await trackEvent('role_switch', { data: { fromRole: currentRole, toRole: newRole } });
}

function showRoleInfo(roleId: string): void {
  const role = getRole(roleId);
  
  if (!role) {
    console.log(chalk.red(`\n❌ Unknown role: ${roleId}\n`));
    return;
  }
  
  console.log(chalk.bold(`\n${role.emoji} ${role.name}\n`));
  console.log(chalk.gray(`  Symbol: ${role.symbol}`));
  console.log(chalk.gray(`  ID: ${role.id}`));
  console.log(chalk.gray(`  Description: ${role.description}\n`));
  
  console.log(chalk.bold('  Permissions:\n'));
  const perms = role.permissions;
  console.log(`    Read:    ${perms.read ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`    Write:   ${perms.write ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`    Delete:  ${perms.delete ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`    Deploy:  ${perms.deploy ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`    Approve: ${perms.approve ? chalk.green('✓') : chalk.red('✗')}`);
  console.log('');
}

function showRolePermissions(roleId: string): void {
  const role = getRole(roleId);
  
  if (!role) {
    console.log(chalk.red(`\n❌ Unknown role: ${roleId}\n`));
    return;
  }
  
  console.log(chalk.bold(`\n🔐 ${role.name} Permissions\n`));
  
  const perms = role.permissions;
  const rows = [
    ['Read', perms.read],
    ['Write', perms.write],
    ['Delete', perms.delete],
    ['Deploy', perms.deploy],
    ['Approve', perms.approve]
  ];
  
  for (const [name, allowed] of rows) {
    const icon = allowed ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${icon} ${name}`);
  }
  console.log('');
}
