import { BaseAdapter, AdapterConfig } from './base.js';
import { generateHybridRules, generateUniversalRules, generateToolConfig } from './rules-generator.js';
import { MODES } from '../core/modes.js';
import { ROLES } from '../core/roles.js';
import path from 'path';
import fs from 'fs-extra';

export interface OpenCodeAgentConfig {
  name: string;
  description: string;
  instructions: string[];
  model?: string;
}

export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface OpenCodeConfig {
  $schema: string;
  agents?: Record<string, OpenCodeAgentConfig>;
  instructions?: string[];
  mcp?: {
    servers: Record<string, MCPServerConfig>;
  };
}

export class OpenCodeAdapter extends BaseAdapter {
  private currentMode?: string;
  private currentRole?: string;
  private currentGate?: string;

  constructor(projectPath: string, options?: { mode?: string; role?: string; gate?: string }) {
    const config: AdapterConfig = {
      name: 'opencode',
      displayName: 'OpenCode',
      configDir: '.opencode',
      rulesDir: '',
      ruleExtension: ''
    };
    super(config, projectPath);
    this.currentMode = options?.mode;
    this.currentRole = options?.role;
    this.currentGate = options?.gate;
  }

  getRulesContent(): string {
    return generateHybridRules({
      tool: 'opencode',
      currentMode: this.currentMode,
      currentRole: this.currentRole,
      currentGate: this.currentGate
    });
  }

  // Override to use .opencode directory for AGENTS.md
  getRulesDir(): string {
    return this.getConfigDir();
  }

  getRulesFilePath(): string {
    return path.join(this.getRulesDir(), 'AGENTS.md');
  }

  async install(dryRun: boolean = false): Promise<import('./base.js').AdapterResult> {
    const result = await super.install(dryRun);
    
    if (!dryRun && result.success) {
      // Create main AGENTS.md file
      const mainAgentsPath = this.getRulesFilePath();
      await this.createMainAgentsFile(mainAgentsPath);
      
      // Create comprehensive opencode.json with agent configurations
      await this.createOpenCodeConfig();
    }
    
    return {
      ...result,
      filesCreated: [
        ...(result.filesCreated || []),
        // super.install already includes the rules file; only add opencode.json
        // here to avoid the duplicate line in `sync` output (Bug 9).
        ...(dryRun ? [] : [path.join(this.getConfigDir(), 'opencode.json')])
      ]
    };
  }
  
  private async createOpenCodeConfig(): Promise<void> {
    const configPath = path.join(this.getConfigDir(), 'opencode.json');
    
    const configContent: OpenCodeConfig = {
      $schema: 'https://opencode.ai/config.json',
      agents: this.generateAgentConfigs(),
      instructions: ['AGENTS.md'],
      mcp: {
        servers: {}
      }
    };
    
    await fs.ensureDir(this.getConfigDir());
    await fs.writeJson(configPath, configContent, { spaces: 2 });
  }

  private generateAgentConfigs(): Record<string, OpenCodeAgentConfig> {
    return {
      research: {
        name: 'Research Agent',
        description: 'Analyzes code, explores options, gathers information',
        instructions: [
          'You are in RESEARCH mode (Ω₁ 🔍)',
          'Permissions: Read-only (R:✓ C:✗ U:✗ D:✗)',
          'Analyze code, explain patterns, document findings',
          'NEVER modify files in this mode',
          'Reference: systemPatterns.md, techContext.md'
        ]
      },
      innovate: {
        name: 'Innovate Agent',
        description: 'Explores ideas, suggests approaches, evaluates options',
        instructions: [
          'You are in INNOVATE mode (Ω₂ 💡)',
          'Permissions: Read + Suggest (R:✓ C:✓ U:✗ D:✗)',
          'Brainstorm solutions, explore alternatives',
          'NEVER write code or modify files',
          'Reference: projectbrief.md, activeContext.md'
        ]
      },
      plan: {
        name: 'Plan Agent',
        description: 'Creates specifications, sequences tasks, designs solutions',
        instructions: [
          'You are in PLAN mode (Ω₃ 📝)',
          'Permissions: Read + Write docs (R:✓ C:✓ U:✓ D:✗)',
          'Create specifications, design architecture',
          'Update memory-bank/*.md files',
          'NEVER modify source code files',
          'Reference: projectbrief.md, systemPatterns.md, activeContext.md'
        ]
      },
      execute: {
        name: 'Execute Agent',
        description: 'Implements code according to specifications',
        instructions: [
          'You are in EXECUTE mode (Ω₄ ⚙️)',
          'Permissions: Full access (R:✓ C:✓ U:✓ D:✓)',
          'Implement code according to plan',
          'Check protection.md before modifications',
          'Log changes to activeContext.md',
          'Reference: projectbrief.md, activeContext.md, protection.md'
        ]
      },
      review: {
        name: 'Review Agent',
        description: 'Validates output, tests code, verifies requirements',
        instructions: [
          'You are in REVIEW mode (Ω₅ 🔎)',
          'Permissions: Read-only (R:✓ C:✗ U:✗ D:✗)',
          'Validate against projectbrief.md',
          'Check for bugs, issues, deviations',
          'NEVER modify files',
          'Report findings clearly'
        ]
      }
    };
  }

  private async createMainAgentsFile(filePath: string): Promise<void> {
    const universalRules = generateUniversalRules({
      currentMode: this.currentMode,
      currentRole: this.currentRole,
      currentGate: this.currentGate
    });
    
    const content = `# RIPER-for-All - OpenCode Agent Configuration
*Generated: ${new Date().toISOString().split('T')[0]}*

${universalRules}

## OpenCode-Specific Instructions

### Agent Mode System

OpenCode uses RIPER agents that map to framework modes:

| Agent | Mode | Symbol | Description |
|-------|------|--------|-------------|
| research-agent | Ω₁ 🔍 Research | Read-only analysis | 
| innovate-agent | Ω₂ 💡 Innovate | Read + suggest ideas |
| plan-agent | Ω₃ 📝 Plan | Read + write docs/plans |
| execute-agent | Ω₄ ⚙️ Execute | Full implementation access |
| review-agent | Ω₅ 🔎 Review | Read-only validation |

### Mode Switching Instructions

When switching agents, you MUST:
1. Load the correct agent configuration from opencode.json
2. Update behavior according to new agent's permissions
3. Reference the appropriate memory files
4. Log the transition to activeContext.md

### Agent Mode Switching Syntax

In OpenCode, switch modes using agent references:
\`\`\`
@research-agent Analyze this codebase
@plan-agent Create implementation plan
@execute-agent Implement the feature
@review-agent Check this code
\`\`\`

### Protection Check Protocol

Before ANY file modification:
1. Check memory-bank/protection.md (Σ₆)
2. Verify current agent permissions match operation
3. Respect protection levels:
   - Ψ₁ 🔒 PROTECTED: STOP and request approval
   - Ψ₂ 🛡️ GUARDED: Show confirmation dialog
   - Ψ₃-Ψ₆: Log warning and proceed with caution
4. Log intended changes to activeContext.md

### Memory Bank Integration

Each agent has specific memory file requirements:

**research-agent**: systemPatterns.md, techContext.md
**innovate-agent**: projectbrief.md, activeContext.md
**plan-agent**: projectbrief.md, systemPatterns.md, activeContext.md, progress.md
**execute-agent**: projectbrief.md, activeContext.md, progress.md, protection.md
**review-agent**: projectbrief.md, systemPatterns.md, progress.md

### Role-Based Agent Permissions

Agents respect role permissions:
- α Product Owner: Can approve PRDs, gates
- Ω Architect: Can approve design, patterns
- δ Developer: Can execute within gates
- ψ QA: Can test, approve QA gate
- λ DevOps: Can deploy, manage infra

### MCP Server Configuration

Configure MCP servers in opencode.json:
\`\`\`json
{
  "mcp": {
    "servers": {
      "github": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"]
      }
    }
  }
}
\`\`\`

---

## 🤖 AI Context

You are an OpenCode agent operating under RIPER-for-All.
Your behavior is controlled by:
- Current Agent (maps to Ω mode)
- Current Role (ρ) permissions
- Current Gate (Γ) stage
- Protection Registry (Ψ) levels

Always check opencode.json for agent configuration.
Always verify permissions before operations.
Always log actions to memory bank.

---
*OpenCode Adapter | RIPER-for-All v1.0*
`;
    await fs.ensureFile(filePath);
    await fs.outputFile(filePath, content, 'utf-8');
  }

  /**
   * Generate MCP configuration for OpenCode
   */
  generateMCPConfig(enabledServers: string[] = []): Record<string, MCPServerConfig> {
    const servers: Record<string, MCPServerConfig> = {};

    if (enabledServers.includes('github')) {
      servers.github = {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: '${env.GITHUB_TOKEN}'
        }
      };
    }

    if (enabledServers.includes('filesystem')) {
      servers.filesystem = {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', this.projectPath]
      };
    }

    return servers;
  }

  /**
   * Install MCP configuration
   */
  async installMCP(enabledServers: string[] = [], dryRun: boolean = false): Promise<{ success: boolean; message: string }> {
    const mcpPath = path.join(this.getConfigDir(), 'opencode.json');

    if (dryRun) {
      return {
        success: true,
        message: `Would update MCP config at ${mcpPath}`
      };
    }

    try {
      // Read existing config or create new
      let config: OpenCodeConfig;
      if (await fs.pathExists(mcpPath)) {
        config = await fs.readJson(mcpPath);
      } else {
        config = {
          $schema: 'https://opencode.ai/config.json',
          agents: this.generateAgentConfigs(),
          instructions: ['AGENTS.md']
        };
      }

      // Add MCP servers
      config.mcp = {
        servers: this.generateMCPConfig(enabledServers)
      };

      await fs.writeJson(mcpPath, config, { spaces: 2 });
      
      return {
        success: true,
        message: `MCP config updated for OpenCode with ${enabledServers.length} servers`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update MCP config: ${error}`
      };
    }
  }
}
