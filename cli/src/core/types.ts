export type Mode = 'research' | 'innovate' | 'plan' | 'execute' | 'review';

export type Phase = 'uninitiated' | 'initializing' | 'development' | 'maintenance';

export interface ModeDefinition {
  id: Mode;
  name: string;
  symbol: string;
  emoji: string;
  description: string;
  permissions: PermissionMatrix;
  allowedOperations: string[];
  forbiddenOperations: string[];
  contextFiles: string[];
}

export interface PermissionMatrix {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface PhaseDefinition {
  id: Phase;
  name: string;
  symbol: string;
  emoji: string;
  description: string;
}

export interface MemoryFile {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  filename: string;
  description: string;
  maxSize?: number;
}

export interface ProtectionLevel {
  id: number;
  name: string;
  symbol: string;
  emoji: string;
  description: string;
}

export interface ToolAdapter {
  name: string;
  displayName: string;
  configLocation: string;
  ruleExtension: string;
  isAvailable(): Promise<boolean>;
  install(rules: string): Promise<void>;
  uninstall(): Promise<void>;
}

export interface MCPService {
  name: string;
  symbol: string;
  description: string;
  config: Record<string, unknown>;
}

export interface ProjectConfig {
  version: string;
  projectName: string;
  projectPath: string;
  tools: Record<string, boolean>;
  memory: {
    location: string;
    format: string;
  };
  mcp: {
    enabled: boolean;
    servers: string[];
  };
  telemetry: {
    enabled: boolean;
    anonymous: boolean;
  };
  dashboard: {
    port: number;
    detach: boolean;
  };
  backup: {
    auto: boolean;
    interval: string;
    maxBackups: number;
  };
}

export interface RuntimeState {
  currentMode: Mode;
  currentPhase: Phase;
  lastModeChange: string;
  session: {
    startTime: string;
    modeHistory: Array<{
      mode: Mode;
      timestamp: string;
    }>;
  };
}

export interface AnalyticsEvent {
  type: 'mode_change' | 'command' | 'workflow' | 'tokens';
  timestamp: string;
  data: Record<string, unknown>;
}

export interface BackupInfo {
  name: string;
  createdAt: string;
  size: number;
  files: string[];
}
