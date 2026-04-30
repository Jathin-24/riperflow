import { canPerformOperation } from './enforcer.js';
import { loadState } from '../config/loader.js';

export class EnforcementError extends Error {
  constructor(
    public readonly reason: string,
    public readonly details: { mode: string; role?: string; gate?: string; action: string; path: string }
  ) {
    super(`${reason} (mode: ${details.mode}, action: ${details.action}, path: ${details.path})`);
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
    throw new EnforcementError(
      verdict.reason ?? 'Operation not allowed',
      { mode, role, gate, action, path: targetPath }
    );
  }
}
