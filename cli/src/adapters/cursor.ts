import { BaseAdapter, AdapterConfig } from './base.js';
import { generateHybridRules, generateToolConfig } from './rules-generator.js';
import { MODES } from '../core/modes.js';
import { ROLES } from '../core/roles.js';
import { listGates } from '../core/gates.js';
import fs from 'fs-extra';
import path from 'path';

export interface CursorMCPConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

export class CursorAdapter extends BaseAdapter {
  private currentMode?: string;
  private currentRole?: string;
  private currentGate?: string;

  constructor(projectPath: string, options?: { mode?: string; role?: string; gate?: string }) {
    const config: AdapterConfig = {
      name: 'cursor',
      displayName: 'Cursor IDE',
      configDir: '.cursor',
      rulesDir: 'rules',
      ruleExtension: '.mdc'
    };
    super(config, projectPath);
    this.currentMode = options?.mode;
    this.currentRole = options?.role;
    this.currentGate = options?.gate;
  }

  /**
   * Generate comprehensive .mdc content with frontmatter
   * Includes mode switching instructions and protection check instructions
   */
  getRulesContent(): string {
    const hybridRules = generateHybridRules({
      tool: 'cursor',
      currentMode: this.currentMode,
      currentRole: this.currentRole,
      currentGate: this.currentGate
    });

    return `---
description: RIPER-for-All Framework Rules
globs: **/*
alwaysApply: true
---

${hybridRules}

## Cursor-Specific Instructions

### Mode Switching in Cursor

When the user switches mode, you MUST:
1. Acknowledge the mode change explicitly
2. Update your behavior according to the new mode's permissions
3. Reference the correct context files for that mode
4. Log the mode change to memory-bank/activeContext.md

### Protection Check Instructions

Before ANY file modification in Cursor:
1. Check memory-bank/protection.md for protection levels
2. Verify current mode allows the operation (ℙ matrix)
3. If file is 🔒 PROTECTED: STOP and ask for approval
4. If file is 🛡️ GUARDED: Show confirmation prompt
5. If file is INFO-DEBUG-TEST-CRITICAL: Log warning and proceed with care

### Cursor Features Integration

**Composer Integration**:
- Always check mode permissions before generating code in Composer
- Include mode context in AI responses
- Reference relevant memory files

**Chat Integration**:
- Start conversations with current mode indicator
- Switch modes when user uses /r, /i, /p, /e, /rev commands
- Maintain mode context across conversation

---
*Generated for Cursor IDE | RIPER-for-All v1.0*
`;
  }

  /**
   * Generate Cursor-specific MCP configuration
   */
  generateMCPConfig(enabledServers: string[] = []): CursorMCPConfig {
    const config: CursorMCPConfig = { mcpServers: {} };

    if (enabledServers.includes('github')) {
      config.mcpServers.github = {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: '${env.GITHUB_TOKEN}'
        }
      };
    }

    if (enabledServers.includes('filesystem')) {
      config.mcpServers.filesystem = {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', this.projectPath]
      };
    }

    return config;
  }

  /**
   * Get the MCP config file path
   */
  getMCPConfigPath(): string {
    return path.join(this.getConfigDir(), 'mcp.json');
  }

  /**
   * Install MCP configuration
   */
  async installMCP(enabledServers: string[] = [], dryRun: boolean = false): Promise<{ success: boolean; message: string }> {
    const mcpConfig = this.generateMCPConfig(enabledServers);
    const mcpPath = this.getMCPConfigPath();

    if (dryRun) {
      return {
        success: true,
        message: `Would create MCP config at ${mcpPath}`
      };
    }

    try {
      await fs.writeFile(mcpPath, JSON.stringify(mcpConfig, null, 2), 'utf-8');
      return {
        success: true,
        message: `MCP config installed for Cursor`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to install MCP config: ${error}`
      };
    }
  }
}
