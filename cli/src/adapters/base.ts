import fs from 'fs-extra';
import path from 'path';

export interface AdapterConfig {
  name: string;
  displayName: string;
  configDir: string;
  rulesDir: string;
  ruleExtension: string;
}

export interface AdapterResult {
  success: boolean;
  message: string;
  filesCreated?: string[];
  filesModified?: string[];
  filesDeleted?: string[];
}

export interface DryRunResult {
  wouldCreate: string[];
  wouldModify: string[];
  wouldDelete: string[];
}

export abstract class BaseAdapter {
  protected config: AdapterConfig;
  protected projectPath: string;

  constructor(config: AdapterConfig, projectPath: string) {
    this.config = config;
    this.projectPath = projectPath;
  }

  abstract getRulesContent(): string;

  getConfigDir(): string {
    return path.join(this.projectPath, this.config.configDir);
  }

  getRulesDir(): string {
    return path.join(this.getConfigDir(), this.config.rulesDir);
  }

  getRulesFilePath(): string {
    return path.join(this.getRulesDir(), `riper${this.config.ruleExtension}`);
  }

  async isInstalled(): Promise<boolean> {
    return await fs.pathExists(this.getRulesFilePath());
  }

  async install(dryRun: boolean = false): Promise<AdapterResult> {
    const rulesFilePath = this.getRulesFilePath();
    const rulesDir = this.getRulesDir();
    const rulesContent = this.getRulesContent();

    if (dryRun) {
      return {
        success: true,
        message: `Would create ${rulesFilePath}`,
        filesCreated: [rulesFilePath]
      };
    }

    try {
      await fs.ensureDir(rulesDir);
      await fs.writeFile(rulesFilePath, rulesContent, 'utf-8');
      
      return {
        success: true,
        message: `Installed RIPER rules to ${this.config.displayName}`,
        filesCreated: [rulesFilePath]
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to install: ${error}`
      };
    }
  }

  async uninstall(dryRun: boolean = false): Promise<AdapterResult> {
    const rulesFilePath = this.getRulesFilePath();

    if (dryRun) {
      return {
        success: true,
        message: `Would delete ${rulesFilePath}`,
        filesDeleted: [rulesFilePath]
      };
    }

    try {
      if (await fs.pathExists(rulesFilePath)) {
        await fs.remove(rulesFilePath);
        return {
          success: true,
          message: `Uninstalled RIPER rules from ${this.config.displayName}`,
          filesDeleted: [rulesFilePath]
        };
      }
      return {
        success: true,
        message: `No rules file found to remove`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to uninstall: ${error}`
      };
    }
  }

  async update(dryRun: boolean = false): Promise<AdapterResult> {
    return this.install(dryRun);
  }

  getAdapterInfo(): AdapterConfig {
    return { ...this.config };
  }
}

export async function createAdapter(
  toolName: string,
  projectPath: string
): Promise<BaseAdapter | null> {
  switch (toolName.toLowerCase()) {
    case 'cursor': {
      const { CursorAdapter } = await import('./cursor.js');
      return new CursorAdapter(projectPath);
    }
    case 'claudecode':
    case 'claude-code': {
      const { ClaudeCodeAdapter } = await import('./claude-code.js');
      return new ClaudeCodeAdapter(projectPath);
    }
    case 'opencode': {
      const { OpenCodeAdapter } = await import('./opencode.js');
      return new OpenCodeAdapter(projectPath);
    }
    case 'kilocode': {
      const { KiloCodeAdapter } = await import('./kilocode.js');
      return new KiloCodeAdapter(projectPath);
    }
    default:
      return null;
  }
}
