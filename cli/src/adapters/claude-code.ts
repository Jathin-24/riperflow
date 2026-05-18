import { BaseAdapter, AdapterConfig } from './base.js';
import { generateHybridRules, generateUniversalRules, generateToolConfig } from './rules-generator.js';
import { safeWrite } from '../utils/safe-write.js';
import path from 'path';
import fs from 'fs-extra';

export interface ClaudeMCPConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

export class ClaudeCodeAdapter extends BaseAdapter {
  private currentMode?: string;
  private currentRole?: string;
  private currentGate?: string;

  constructor(projectPath: string, options?: { mode?: string; role?: string; gate?: string }) {
    const config: AdapterConfig = {
      name: 'claudeCode',
      displayName: 'Claude Code',
      configDir: '.claude',
      rulesDir: 'rules',
      ruleExtension: '.md'
    };
    super(config, projectPath);
    this.currentMode = options?.mode;
    this.currentRole = options?.role;
    this.currentGate = options?.gate;
  }

  /**
   * Generate comprehensive rules for Claude Code
   * Includes tool use instructions and memory bank access
   */
  getRulesContent(): string {
    return generateHybridRules({
      tool: 'claude-code',
      currentMode: this.currentMode,
      currentRole: this.currentRole,
      currentGate: this.currentGate
    });
  }

  /**
   * Install rules and create CLAUDE.md
   */
  async install(dryRun: boolean = false): Promise<import('./base.js').AdapterResult> {
    const rulesResult = await super.install(dryRun);
    
    if (!dryRun && rulesResult.success) {
      await this.createClaudeMdFile();
    }
    
    return {
      ...rulesResult,
      filesCreated: [
        ...(rulesResult.filesCreated || []),
        ...(dryRun ? [] : [path.join(this.projectPath, 'CLAUDE.md')])
      ]
    };
  }

  /**
   * Create comprehensive CLAUDE.md with tool use instructions
   */
  private async createClaudeMdFile(): Promise<void> {
    const claudeMdPath = path.join(this.projectPath, 'CLAUDE.md');
    const universalRules = generateUniversalRules({
      currentMode: this.currentMode,
      currentRole: this.currentRole,
      currentGate: this.currentGate
    });
    
    // universalRules already starts with `# Riperflow - Universal Rules` (H1) —
    // don't add a second H1 preamble. Claude Code-specific guidance is appended
    // below as H2.
    const content = `${universalRules}

## Claude Code Tool Use Instructions

### Memory Bank Access Tools

Claude Code can access RIPER memory bank files using the following tool patterns:

**Read Memory File**:
\`\`\`
Read(path: "memory-bank/projectbrief.md")
Read(path: "memory-bank/activeContext.md")
\`\`\`

**Update Memory File** (only in Plan/Execute modes):
\`\`\`
# Ω₃ 📝 Plan or Ω₄ ⚙️ Execute mode required
WriteToFile(path: "memory-bank/activeContext.md", content: "...")
Edit(content: "...", replace_all: false)
\`\`\`

### Mode-Aware Tool Usage

**Ω₁ 🔍 Research Mode**:
- Use Read tool to analyze code
- Use Bash tool to search/grep
- Use LS tool to explore structure
- ❌ NEVER use WriteToFile or Edit

**Ω₂ 💡 Innovate Mode**:
- Read existing code for context
- Discuss ideas in conversation
- ❌ NO file modifications

**Ω₃ 📝 Plan Mode**:
- Read current state
- Write to memory-bank/*.md files
- Create specifications
- ❌ NO code changes

**Ω₄ ⚙️ Execute Mode**:
- Full tool access
- Read/Write/Edit files
- Check protection.md before modifications
- Log changes to activeContext.md

**Ω₅ 🔎 Review Mode**:
- Read code and tests
- Verify against requirements
- Report issues
- ❌ NO modifications

### Protection Check Protocol

Before ANY file modification:
1. Read memory-bank/protection.md
2. Check if target file has protection markers
3. Respect Ψ₁ 🔒 PROTECTED - ask for approval
4. Respect Ψ₂ 🛡️ GUARDED - confirm before edit
5. Log Ψ₃-Ψ₆ warnings to activeContext.md

### Role-Based Tool Restrictions

- **α Product Owner**: Can approve PRDs, gate advancement
- **Ω Architect**: Can approve design changes, system patterns
- **δ Developer**: Can implement code within active gate
- **ψ QA**: Can write tests, approve QA gate
- **λ DevOps**: Can deploy, manage infrastructure

### Context Files Loading

Always load these files at conversation start:
1. .riper/state.json - Current mode/state
2. memory-bank/projectbrief.md - Requirements
3. memory-bank/activeContext.md - Current focus
4. memory-bank/protection.md - Protected regions

---

## 🤖 AI Context

You are operating under Riperflow framework. Your behavior is governed by:
- Current Mode (Ω): Defines your permissions
- Current Role (ρ): Defines your responsibilities  
- Current Gate (Γ): Defines workflow stage
- Protection Registry (Ψ): Defines file safety levels

Always check .riper/state.json before operations.
Always respect mode permissions (ℙ matrix).
Always log significant actions to memory bank.

---
*Claude Code Adapter | Riperflow v1.0*
`;
    // safeWrite backs up any pre-existing user-authored CLAUDE.md to
    // CLAUDE.md.bak-<timestamp> before overwriting (Bug 19).
    await safeWrite(claudeMdPath, content);
  }

  /**
   * Generate Claude Code MCP configuration
   */
  generateMCPConfig(enabledServers: string[] = []): ClaudeMCPConfig {
    const config: ClaudeMCPConfig = { mcpServers: {} };

    if (enabledServers.includes('github')) {
      config.mcpServers.github = {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: '${env.GITHUB_TOKEN}'
        }
      };
    }

    if (enabledServers.includes('web-search')) {
      config.mcpServers.braveSearch = {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-brave-search'],
        env: {
          BRAVE_API_KEY: '${env.BRAVE_API_KEY}'
        }
      };
    }

    return config;
  }

  /**
   * Get MCP config path
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
        message: `MCP config installed for Claude Code`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to install MCP config: ${error}`
      };
    }
  }
}
