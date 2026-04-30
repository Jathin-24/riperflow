import chalk from 'chalk';

export interface MCPNotification {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action?: string;
}

export class MCPNotifier {
  private notifications: MCPNotification[] = [];

  notify(notification: MCPNotification): void {
    this.notifications.push(notification);
    this.display(notification);
  }

  private display(notification: MCPNotification): void {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const colors = {
      info: chalk.cyan,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };

    console.log(`\n${icons[notification.type]} ${colors[notification.type].bold(notification.title)}`);
    console.log(colors[notification.type](`  ${notification.message}`));

    if (notification.action) {
      console.log(chalk.gray(`  → ${notification.action}`));
    }
    console.log('');
  }

  promptRestart(toolName: string): void {
    this.notify({
      type: 'info',
      title: 'IDE Restart Required',
      message: `MCP configuration updated for ${toolName}.`,
      action: `Please restart ${toolName} to activate the MCP server.`
    });
  }

  promptCredentials(serverName: string, envVars: Record<string, string>): void {
    const varList = Object.keys(envVars).join(', ');
    this.notify({
      type: 'warning',
      title: 'Credentials Required',
      message: `${serverName} requires environment variables: ${varList}`,
      action: 'Set these in your shell profile or IDE settings.'
    });
  }

  successInstall(serverName: string): void {
    this.notify({
      type: 'success',
      title: 'MCP Server Installed',
      message: `${serverName} has been installed successfully.`
    });
  }

  successConfigure(toolName: string, serverName: string): void {
    this.notify({
      type: 'success',
      title: 'MCP Configured',
      message: `${serverName} is now configured for ${toolName}.`,
      action: `Restart ${toolName} to use the MCP server.`
    });
  }

  getAllNotifications(): MCPNotification[] {
    return [...this.notifications];
  }

  clear(): void {
    this.notifications = [];
  }
}

export function createMCPNotifier(): MCPNotifier {
  return new MCPNotifier();
}
