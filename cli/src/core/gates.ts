export type GateStage = 'design' | 'development' | 'testing' | 'review' | 'deploy';

export interface QualityGate {
  id: GateStage;
  name: string;
  symbol: string;
  emoji: string;
  description: string;
  requiredApprovals: string[];
  autoAdvance: boolean;
}

export const GATES: Record<GateStage, QualityGate> = {
  design: {
    id: 'design',
    name: 'Design Review',
    symbol: 'γ',
    emoji: '📐',
    description: 'Architecture and design approval',
    requiredApprovals: ['po', 'architect'],
    autoAdvance: false
  },
  development: {
    id: 'development',
    name: 'Code Complete',
    symbol: 'ε',
    emoji: '✨',
    description: 'Implementation finished',
    requiredApprovals: ['dev'],
    autoAdvance: true
  },
  testing: {
    id: 'testing',
    name: 'QA Pass',
    symbol: 'τ',
    emoji: '🧪',
    description: 'All tests passing',
    requiredApprovals: ['qa'],
    autoAdvance: false
  },
  review: {
    id: 'review',
    name: 'Code Review',
    symbol: 'ρ',
    emoji: '👀',
    description: 'Peer review approved',
    requiredApprovals: ['architect', 'qa'],
    autoAdvance: false
  },
  deploy: {
    id: 'deploy',
    name: 'Deploy Ready',
    symbol: 'ω',
    emoji: '🚀',
    description: 'Ready for deployment',
    requiredApprovals: ['po', 'devops'],
    autoAdvance: false
  }
};

export interface GateStatus {
  gate: GateStage;
  approved: boolean;
  approvers: string[];
  timestamp: string | null;
}

export const GATE_ORDER: GateStage[] = ['design', 'development', 'testing', 'review', 'deploy'];

export function getGate(gateId: string): QualityGate | undefined {
  return GATES[gateId as GateStage];
}

export function listGates(): QualityGate[] {
  return GATE_ORDER.map(id => GATES[id]);
}

export function getNextGate(currentGate: GateStage): GateStage | null {
  const currentIndex = GATE_ORDER.indexOf(currentGate);
  if (currentIndex === -1 || currentIndex === GATE_ORDER.length - 1) {
    return null;
  }
  return GATE_ORDER[currentIndex + 1];
}

export function getPreviousGate(currentGate: GateStage): GateStage | null {
  const currentIndex = GATE_ORDER.indexOf(currentGate);
  if (currentIndex <= 0) {
    return null;
  }
  return GATE_ORDER[currentIndex - 1];
}

/**
 * Gate Blocker - defines what blocks progression to next gate
 */
export interface GateBlocker {
  type: 'missing_approval' | 'pending_tests' | 'uncommitted_changes' | 'protection_violation' | 'manual_hold';
  description: string;
  severity: 'error' | 'warning';
  autoResolvable: boolean;
}

/**
 * Gate Progression Result
 */
export interface GateProgressionResult {
  canProgress: boolean;
  currentGate: GateStage;
  targetGate: GateStage;
  blockers: GateBlocker[];
  missingApprovals: string[];
  requiredActions: string[];
}

/**
 * Check if a role can approve a specific gate
 */
export function canApproveGate(gate: GateStage, roleId: string): boolean {
  const gateDef = GATES[gate];
  if (!gateDef) return false;
  return gateDef.requiredApprovals.includes(roleId);
}

/**
 * Get all roles that can approve the current gate
 */
export function getApproversForGate(gate: GateStage): string[] {
  const gateDef = GATES[gate];
  if (!gateDef) return [];
  return [...gateDef.requiredApprovals];
}

/**
 * Check gate status and return blockers
 */
export function checkGateBlockers(
  currentGate: GateStage,
  gateStatus: GateStatus,
  options?: {
    hasUncommittedChanges?: boolean;
    hasTestFailures?: boolean;
    hasProtectionViolations?: boolean;
  }
): GateBlocker[] {
  const blockers: GateBlocker[] = [];
  const gateDef = GATES[currentGate];
  
  if (!gateDef) return blockers;

  // Check required approvals
  const missingApprovals = gateDef.requiredApprovals.filter(
    role => !gateStatus.approvers.includes(role)
  );
  
  if (missingApprovals.length > 0) {
    blockers.push({
      type: 'missing_approval',
      description: `Missing approvals from: ${missingApprovals.join(', ')}`,
      severity: 'error',
      autoResolvable: false
    });
  }

  // Check uncommitted changes (for development gate)
  if (options?.hasUncommittedChanges && currentGate === 'development') {
    blockers.push({
      type: 'uncommitted_changes',
      description: 'Uncommitted changes detected - commit or stash before proceeding',
      severity: 'error',
      autoResolvable: true
    });
  }

  // Check test failures (for testing gate)
  if (options?.hasTestFailures && currentGate === 'testing') {
    blockers.push({
      type: 'pending_tests',
      description: 'Test failures detected - fix before proceeding',
      severity: 'error',
      autoResolvable: true
    });
  }

  // Check protection violations
  if (options?.hasProtectionViolations) {
    blockers.push({
      type: 'protection_violation',
      description: 'Protection level violations detected',
      severity: 'error',
      autoResolvable: false
    });
  }

  return blockers;
}

/**
 * Validate if progression to next gate is allowed
 */
export function validateGateProgression(
  currentGate: GateStage,
  gateStatus: GateStatus,
  options?: {
    hasUncommittedChanges?: boolean;
    hasTestFailures?: boolean;
    hasProtectionViolations?: boolean;
    force?: boolean;
  }
): GateProgressionResult {
  const targetGate = getNextGate(currentGate);
  
  if (!targetGate) {
    return {
      canProgress: false,
      currentGate,
      targetGate: currentGate,
      blockers: [{
        type: 'manual_hold',
        description: 'Already at final gate - no further progression available',
        severity: 'warning',
        autoResolvable: false
      }],
      missingApprovals: [],
      requiredActions: []
    };
  }

  const blockers = checkGateBlockers(currentGate, gateStatus, options);
  const gateDef = GATES[currentGate];
  
  const missingApprovals = gateDef?.requiredApprovals.filter(
    role => !gateStatus.approvers.includes(role)
  ) || [];

  const canProgress = options?.force 
    ? true 
    : blockers.filter(b => b.severity === 'error').length === 0;

  const requiredActions: string[] = [];
  
  if (missingApprovals.length > 0) {
    requiredActions.push(`Get approval from: ${missingApprovals.join(', ')}`);
  }
  
  blockers.forEach(blocker => {
    if (blocker.type === 'uncommitted_changes') {
      requiredActions.push('Commit or stash all changes');
    } else if (blocker.type === 'pending_tests') {
      requiredActions.push('Fix all test failures');
    }
  });

  return {
    canProgress,
    currentGate,
    targetGate,
    blockers,
    missingApprovals,
    requiredActions
  };
}

/**
 * Check if an operation is allowed at the current gate
 */
export function isOperationAllowedAtGate(
  gate: GateStage,
  operation: 'read' | 'write' | 'delete' | 'deploy',
  roleId?: string
): { allowed: boolean; reason?: string } {
  // All gates allow read operations
  if (operation === 'read') {
    return { allowed: true };
  }

  // Deploy only allowed at deploy gate
  if (operation === 'deploy') {
    if (gate !== 'deploy') {
      return { 
        allowed: false, 
        reason: `Deploy operations only allowed at Deploy Ready gate (currently at ${GATES[gate]?.name || gate})` 
      };
    }
    // Deploy requires DevOps role
    if (roleId && !['devops', 'po'].includes(roleId)) {
      return { 
        allowed: false, 
        reason: 'Deploy operations require DevOps or Product Owner role' 
      };
    }
    return { allowed: true };
  }

  // Write operations allowed in development, testing, and review gates
  if (operation === 'write') {
    const allowedGates: GateStage[] = ['development', 'testing', 'review'];
    if (!allowedGates.includes(gate)) {
      return { 
        allowed: false, 
        reason: `Write operations not allowed at ${GATES[gate]?.name || gate} gate. Must be in Development, Testing, or Review.` 
      };
    }
    return { allowed: true };
  }

  // Delete operations only in development with proper role
  if (operation === 'delete') {
    if (gate !== 'development') {
      return { 
        allowed: false, 
        reason: `Delete operations only allowed in Development gate (currently at ${GATES[gate]?.name || gate})` 
      };
    }
    if (roleId && !['architect', 'devops', 'po'].includes(roleId)) {
      return { 
        allowed: false, 
        reason: 'Delete operations require Architect, DevOps, or Product Owner role at Development gate' 
      };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Unknown operation type' };
}

/**
 * Format gate blockers for display
 */
export function formatGateBlockers(blockers: GateBlocker[]): string {
  if (blockers.length === 0) {
    return '✓ No blockers - ready to proceed';
  }
  
  return blockers.map(b => {
    const icon = b.severity === 'error' ? '✗' : '⚠';
    const auto = b.autoResolvable ? '[AUTO-FIXABLE]' : '[MANUAL]';
    return `${icon} ${auto} ${b.description}`;
  }).join('\n');
}
