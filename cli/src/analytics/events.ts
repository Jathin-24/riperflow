import { createAnalyticsStorage, AnalyticsEvent } from './storage.js';

export type EventType = 
  | 'mode_change'
  | 'command_run'
  | 'adapter_install'
  | 'adapter_uninstall'
  | 'mcp_add'
  | 'mcp_remove'
  | 'mcp_install'
  | 'memory_sync'
  | 'backup_create'
  | 'restore_execute'
  | 'dashboard_view'
  | 'role_switch'
  | 'gate_advance'
  | 'gate_approve'
  | 'prd_create'
  | 'prd_approve';

export interface TrackOptions {
  tool?: string;
  data?: Record<string, unknown>;
}

export async function trackEvent(event: EventType, options: TrackOptions = {}): Promise<void> {
  const storage = createAnalyticsStorage();
  
  const analyticsEvent: AnalyticsEvent = {
    timestamp: new Date().toISOString(),
    event,
    data: options.data || {},
    tool: options.tool
  };

  try {
    await storage.write(analyticsEvent);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

export async function trackModeChange(fromMode: string, toMode: string): Promise<void> {
  await trackEvent('mode_change', {
    data: { fromMode, toMode }
  });
}

export async function trackCommand(command: string, args: string[] = []): Promise<void> {
  await trackEvent('command_run', {
    data: { command, args }
  });
}

export async function trackAdapterInstall(adapterName: string): Promise<void> {
  await trackEvent('adapter_install', {
    tool: adapterName,
    data: { adapter: adapterName }
  });
}

export async function trackAdapterUninstall(adapterName: string): Promise<void> {
  await trackEvent('adapter_uninstall', {
    tool: adapterName,
    data: { adapter: adapterName }
  });
}

export async function trackMcpAction(action: 'add' | 'remove' | 'install', server: string): Promise<void> {
  const eventType = `mcp_${action}` as EventType;
  await trackEvent(eventType, {
    data: { server, action }
  });
}

export async function trackMemorySync(): Promise<void> {
  await trackEvent('memory_sync');
}

export async function trackBackupCreate(backupName: string): Promise<void> {
  await trackEvent('backup_create', {
    data: { backupName }
  });
}

export async function trackRestore(backupName: string): Promise<void> {
  await trackEvent('restore_execute', {
    data: { backupName }
  });
}

export async function trackDashboardView(type: 'tui' | 'web'): Promise<void> {
  await trackEvent('dashboard_view', {
    data: { type }
  });
}
