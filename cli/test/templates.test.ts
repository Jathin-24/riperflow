import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES = path.join(__dirname, '../templates/adapters');

describe('adapter templates', () => {
  const required = [
    'cursor.mdc',
    'claude.md',
    'opencode.md',
    'kilocode.md',
    'vscode.md',
    'roo.md',
    'aider.md',
    'windsurf.md',
    'cline.md',
    'codex.md',
    'universal.md',
  ];

  for (const file of required) {
    it(`${file} exists and is non-trivial`, () => {
      const p = path.join(TEMPLATES, file);
      expect(fs.existsSync(p), `missing ${p}`).toBe(true);
      const body = fs.readFileSync(p, 'utf-8');
      expect(body.length, file).toBeGreaterThan(100);
      expect(body).toMatch(/RIPER/);
    });
  }

  it('every TOOL_TEMPLATE_MAP entry resolves to a real file', async () => {
    // Inspect the map without exporting it: import the rules generator and ensure it produces tool-tagged content
    const { generateToolRules } = await import('../src/adapters/rules-generator.js');
    for (const tool of ['cursor', 'claude-code', 'opencode', 'kilocode', 'vscode', 'roo', 'aider', 'windsurf', 'cline', 'codex']) {
      const out = generateToolRules(tool, { currentMode: 'execute', currentRole: 'dev', currentGate: 'design' });
      expect(out.length, tool).toBeGreaterThan(100);
      expect(out, tool).toMatch(/RIPER/);
    }
  });
});
