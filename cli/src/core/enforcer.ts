import type { Mode, PermissionMatrix } from './types.js';
import { MODES, getMode } from './modes.js';
import { ROLES, getRole } from './roles.js';
import { GATES, listGates, type GateStage, type QualityGate } from './gates.js';
import { PROTECTION_LEVELS, getProtection, type ProtectionLevel } from './protection.js';

export interface OperationRequest {
  action: 'read' | 'write' | 'delete';
  path: string;
  currentMode: Mode;
  currentRole?: string;
  currentGate?: GateStage;
}

export interface EnforcementResult {
  allowed: boolean;
  reason?: string;
  requiredApprovals?: string[];
  violations?: string[];
  warnings?: string[];
}

/**
 * Check if an operation can be performed based on current mode, role, and gate
 */
export function canPerformOperation(request: OperationRequest): EnforcementResult {
  const { action, path, currentMode, currentRole, currentGate } = request;
  
  const result: EnforcementResult = {
    allowed: true,
    violations: [],
    warnings: []
  };

  // Check mode permissions
  const modeCheck = checkModePermissions(action, currentMode);
  if (!modeCheck.allowed) {
    result.allowed = false;
    result.reason = modeCheck.reason;
    result.violations!.push(modeCheck.reason!);
  }

  // Check role-based permissions
  if (currentRole) {
    const roleCheck = checkRolePermissions(action, path, currentRole);
    if (!roleCheck.allowed) {
      result.allowed = false;
      result.reason = roleCheck.reason;
      result.violations!.push(roleCheck.reason!);
    }
    if (roleCheck.warnings) {
      result.warnings!.push(...roleCheck.warnings);
    }
  }

  // Check gate stage blockers
  if (currentGate) {
    const gateCheck = checkGateBlockers(action, currentGate);
    if (!gateCheck.allowed) {
      result.allowed = false;
      result.reason = gateCheck.reason;
      result.requiredApprovals = gateCheck.requiredApprovals;
      result.violations!.push(gateCheck.reason!);
    }
  }

  return result;
}

/**
 * Check if the current mode allows the requested action
 */
function checkModePermissions(
  action: OperationRequest['action'],
  mode: Mode
): { allowed: boolean; reason?: string } {
  const modeDef = getMode(mode);
  
  if (!modeDef) {
    return { allowed: false, reason: `Unknown mode: ${mode}` };
  }

  const perms = modeDef.permissions;

  switch (action) {
    case 'read':
      if (!perms.read) {
        return { 
          allowed: false, 
          reason: `Mode ${mode} (${modeDef.symbol} ${modeDef.emoji}) does not allow READ operations` 
        };
      }
      break;
    case 'write':
      if (!perms.update && !perms.create) {
        return { 
          allowed: false, 
          reason: `Mode ${mode} (${modeDef.symbol} ${modeDef.emoji}) does not allow WRITE operations. ℙ(${modeDef.symbol})=${JSON.stringify(perms)}` 
        };
      }
      break;
    case 'delete':
      if (!perms.delete) {
        return { 
          allowed: false, 
          reason: `Mode ${mode} (${modeDef.symbol} ${modeDef.emoji}) does not allow DELETE operations` 
        };
      }
      break;
  }

  return { allowed: true };
}

/**
 * Check role-based permissions for an action
 */
function checkRolePermissions(
  action: OperationRequest['action'],
  path: string,
  roleId: string
): { allowed: boolean; reason?: string; warnings?: string[] } {
  const role = getRole(roleId);
  const warnings: string[] = [];
  
  if (!role) {
    return { allowed: false, reason: `Unknown role: ${roleId}` };
  }

  const perms = role.permissions;

  switch (action) {
    case 'read':
      if (!perms.read) {
        return { 
          allowed: false, 
          reason: `Role ${role.name} (${role.symbol}) does not have READ permission` 
        };
      }
      break;
    case 'write':
      if (!perms.write) {
        return { 
          allowed: false, 
          reason: `Role ${role.name} (${role.symbol}) does not have WRITE permission` 
        };
      }
      break;
    case 'delete':
      if (!perms.delete) {
        return { 
          allowed: false, 
          reason: `Role ${role.name} (${role.symbol}) does not have DELETE permission` 
        };
      }
      break;
  }

  // Special warnings for certain roles
  if (role.id === 'dev' && action === 'delete') {
    warnings.push(`Developer role deleting files - ensure this is intentional`);
  }

  if (role.id === 'qa' && action === 'write') {
    warnings.push(`QA role writing code - typically restricted to test files`);
  }

  return { allowed: true, warnings: warnings.length > 0 ? warnings : undefined };
}

/**
 * Check if current gate stage blocks the operation
 */
function checkGateBlockers(
  action: OperationRequest['action'],
  gate: GateStage
): { allowed: boolean; reason?: string; requiredApprovals?: string[] } {
  const gateDef = GATES[gate];
  
  if (!gateDef) {
    return { allowed: false, reason: `Unknown gate stage: ${gate}` };
  }

  // Code modifications blocked before Development gate
  if ((action === 'write' || action === 'delete') && gate === 'design') {
    return {
      allowed: false,
      reason: `Code modifications blocked at ${gateDef.name} (${gateDef.symbol}) gate. Advance to Development gate first.`,
      requiredApprovals: gateDef.requiredApprovals
    };
  }

  // Deploy-specific operations blocked before Deploy gate
  if (action === 'write' && gate === 'deploy') {
    // Special handling for deployment operations
    // This would need to be checked against the actual operation context
  }

  return { allowed: true };
}

/**
 * Check protection level for a specific path
 */
export function checkProtectionLevel(
  path: string,
  action: OperationRequest['action'],
  protectionRegistry: Record<string, ProtectionLevel>
): {
  level: string;
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
} {
  const protectionLevel = protectionRegistry[path] || 'none';
  
  if (protectionLevel === 'none') {
    return { level: 'none', allowed: true };
  }

  const levelDef = getProtection(protectionLevel);
  
  if (!levelDef) {
    return { level: protectionLevel, allowed: true };
  }

  // locked/frozen - Block all modifications
  if (protectionLevel === 'locked' || protectionLevel === 'frozen') {
    return {
      level: protectionLevel,
      allowed: false,
      reason: `Path ${path} is ${levelDef.name} (${levelDef.symbol} ${levelDef.emoji}) - NEVER modify without explicit approval`,
      requiresApproval: true
    };
  }

  // review - Require confirmation
  if (protectionLevel === 'review') {
    return {
      level: protectionLevel,
      allowed: true, // Allowed but with warning
      reason: `Path ${path} is ${levelDef.name} (${levelDef.symbol} ${levelDef.emoji}) - confirmation required`,
      requiresApproval: true
    };
  }

  // confirm/warn - Log warning but allow
  return {
    level: protectionLevel,
    allowed: true,
    reason: `Path ${path} has protection level ${levelDef.name} (${levelDef.symbol}) - proceed with caution`
  };
}

/**
 * Validate a complete operation with all enforcement layers
 */
export function validateOperation(
  request: OperationRequest,
  options?: {
    protectionRegistry?: Record<string, ProtectionLevel>;
    strict?: boolean;
  }
): EnforcementResult {
  const { protectionRegistry = {}, strict = false } = options || {};
  
  // First check basic permissions
  const result = canPerformOperation(request);
  
  // Then check protection levels
  if (request.action !== 'read' && protectionRegistry[request.path]) {
    const protectionCheck = checkProtectionLevel(
      request.path,
      request.action,
      protectionRegistry
    );
    
    if (!protectionCheck.allowed) {
      result.allowed = false;
      result.reason = protectionCheck.reason;
      result.violations!.push(protectionCheck.reason!);
    } else if (protectionCheck.requiresApproval) {
      result.warnings!.push(protectionCheck.reason!);
    }
  }

  // In strict mode, any warning becomes a violation
  if (strict && result.warnings && result.warnings.length > 0) {
    result.allowed = false;
    result.violations!.push(...result.warnings);
    result.warnings = [];
  }

  return result;
}

/**
 * Get a summary of current enforcement state
 */
export function getEnforcementSummary(
  mode: Mode,
  role?: string,
  gate?: GateStage
): {
  mode: string;
  permissions: PermissionMatrix;
  role?: string;
  rolePermissions?: string[];
  gate?: string;
  gateBlockers?: string[];
} {
  const modeDef = getMode(mode);
  const roleDef = role ? getRole(role) : undefined;
  const gateDef = gate ? GATES[gate] : undefined;

  return {
    mode: modeDef ? `${modeDef.symbol} ${modeDef.name}` : mode,
    permissions: modeDef?.permissions || { read: false, create: false, update: false, delete: false },
    role: roleDef?.name,
    rolePermissions: roleDef ? 
      Object.entries(roleDef.permissions)
        .filter(([_, v]) => v)
        .map(([k]) => k) : undefined,
    gate: gateDef?.name,
    gateBlockers: gateDef ? 
      gate === 'design' ? ['Code modifications blocked'] : 
      gate === 'deploy' ? ['Infrastructure changes require approval'] : undefined : undefined
  };
}

/**
 * Log an enforcement decision for audit purposes
 */
export function createEnforcementLog(
  request: OperationRequest,
  result: EnforcementResult,
  timestamp: string = new Date().toISOString()
): Record<string, unknown> {
  return {
    timestamp,
    operation: request.action,
    path: request.path,
    mode: request.currentMode,
    role: request.currentRole,
    gate: request.currentGate,
    allowed: result.allowed,
    reason: result.reason,
    violations: result.violations,
    warnings: result.warnings,
    requiredApprovals: result.requiredApprovals
  };
}
