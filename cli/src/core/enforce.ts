import { canPerformOperation } from './enforcer.js';
import { loadState } from '../config/loader.js';
import { logViolation } from './violations.js';
import type { ViolationType } from './violations.js';

function classifyViolation(action: string): ViolationType {
  if (action === 'delete') return 'unauthorized_delete';
  if (action === 'write' || action === 'create') return 'unauthorized_write';
  return 'mode_violation';
}

// Read-only modes whose users typically just need to switch to a write-capable
// mode (Plan for docs, Execute for code). Used to add a friendly hint to
// otherwise math-notation error messages.
const READ_ONLY_MODES = new Set(['research', 'innovate', 'review']);

export class EnforcementError extends Error {
  constructor(
    public readonly reason: string,
    public readonly details: { mode: string; role?: string; gate?: string; action: string; path: string }
  ) {
    const isWriteAttempt = details.action === 'write' || details.action === 'create' || details.action === 'delete';
    const hint = isWriteAttempt && READ_ONLY_MODES.has(details.mode)
      ? `\n   👉 Switch with \`riperflow p\` (Plan, docs only) or \`riperflow e\` (Execute, full write), then retry.`
      : '';
    super(`${reason} (mode: ${details.mode}, action: ${details.action}, path: ${details.path})${hint}`);
    this.name = 'EnforcementError';
  }
}

export async function enforce(
  action: 'read' | 'write' | 'delete' | 'create',
  targetPath: string
): Promise<void> {
  const state = await loadState();
  const mode = state?.currentMode ?? 'research';
  const role = state?.currentRole;
  // gate stage — read from state.gateStatuses.current if present
  const gate = state?.gateStatuses?.current;

  // Map 'create' to 'write' for the enforcer's action type
  const enforcerAction: 'read' | 'write' | 'delete' = action === 'create' ? 'write' : action;

  const verdict = canPerformOperation({
    action: enforcerAction,
    path: targetPath,
    currentMode: mode,
    currentRole: role,
    currentGate: gate,
  });

  if (!verdict.allowed) {
    // Log the violation (non-blocking — never lets a logger error mask the throw)
    try {
      await logViolation(process.cwd(), {
        type: classifyViolation(action),
        severity: 'error',
        mode,
        role,
        gate,
        path: targetPath,
        action,
        description: verdict.reason ?? 'Operation not allowed',
        reason: verdict.reason,
        resolution: 'blocked',
      });
    } catch {
      // Swallow logger errors — surface the EnforcementError instead
    }

    throw new EnforcementError(
      verdict.reason ?? 'Operation not allowed',
      { mode, role, gate, action, path: targetPath }
    );
  }
}
