import { ModeDefinition, PhaseDefinition, MemoryFile, ProtectionLevel } from './types.js';

export const MODES: Record<string, ModeDefinition> = {
  research: {
    id: 'research',
    name: 'Research',
    symbol: 'Ω₁',
    emoji: '🔍',
    description: 'Gather information and document findings',
    permissions: {
      read: true,
      create: false,
      update: false,
      delete: false
    },
    allowedOperations: ['read_files', 'ask_questions', 'observe_code', 'document_findings'],
    forbiddenOperations: ['modify_files', 'write_code', 'delete_content', 'refactor', 'suggest_ideas', 'create_plan'],
    contextFiles: ['systemPatterns.md', 'techContext.md']
  },
  innovate: {
    id: 'innovate',
    name: 'Innovate',
    symbol: 'Ω₂',
    emoji: '💡',
    description: 'Explore options and suggest ideas',
    permissions: {
      read: true,
      create: true,
      update: false,
      delete: false
    },
    allowedOperations: ['read_files', 'ask_questions', 'suggest_ideas', 'explore_options', 'evaluate_approaches'],
    forbiddenOperations: ['modify_files', 'write_code', 'delete_content', 'refactor', 'create_plan', 'implement_code'],
    contextFiles: ['projectbrief.md', 'activeContext.md']
  },
  plan: {
    id: 'plan',
    name: 'Plan',
    symbol: 'Ω₃',
    emoji: '📝',
    description: 'Create specifications and sequence steps',
    permissions: {
      read: true,
      create: true,
      update: true,
      delete: false
    },
    allowedOperations: ['read_files', 'ask_questions', 'create_plan', 'detail_specifications', 'sequence_steps'],
    forbiddenOperations: ['modify_files', 'write_code', 'delete_content', 'implement_code'],
    contextFiles: ['projectbrief.md', 'systemPatterns.md', 'activeContext.md', 'progress.md']
  },
  execute: {
    id: 'execute',
    name: 'Execute',
    symbol: 'Ω₄',
    emoji: '⚙️',
    description: 'Implement code according to plan',
    permissions: {
      read: true,
      create: true,
      update: true,
      delete: true
    },
    allowedOperations: ['read_files', 'modify_files', 'write_code', 'implement_code'],
    forbiddenOperations: ['deviate_from_plan', 'improve_code', 'create_new_features'],
    contextFiles: ['projectbrief.md', 'activeContext.md', 'progress.md', 'protection.md']
  },
  review: {
    id: 'review',
    name: 'Review',
    symbol: 'Ω₅',
    emoji: '🔎',
    description: 'Validate output against requirements',
    permissions: {
      read: true,
      create: false,
      update: false,
      delete: false
    },
    allowedOperations: ['read_files', 'validate_output', 'verify_against_plan', 'report_deviations'],
    forbiddenOperations: ['modify_files', 'write_code', 'improve_code'],
    contextFiles: ['projectbrief.md', 'systemPatterns.md', 'progress.md']
  }
};

export const PHASES: Record<string, PhaseDefinition> = {
  uninitiated: {
    id: 'uninitiated',
    name: 'UNINITIATED',
    symbol: 'Π₁',
    emoji: '🌱',
    description: 'Framework installed but not started'
  },
  initializing: {
    id: 'initializing',
    name: 'INITIALIZING',
    symbol: 'Π₂',
    emoji: '🚧',
    description: 'Setup in progress'
  },
  development: {
    id: 'development',
    name: 'DEVELOPMENT',
    symbol: 'Π₃',
    emoji: '🏗️',
    description: 'Main development work'
  },
  maintenance: {
    id: 'maintenance',
    name: 'MAINTENANCE',
    symbol: 'Π₄',
    emoji: '🔧',
    description: 'Long-term support'
  }
};

export const MEMORY_FILES: Record<string, MemoryFile> = {
  projectbrief: {
    id: 'projectbrief',
    name: 'Project Brief',
    symbol: 'Σ₁',
    emoji: '📋',
    filename: 'projectbrief.md',
    description: 'Requirements, scope, criteria',
    maxSize: 2048
  },
  systemPatterns: {
    id: 'systemPatterns',
    name: 'System Patterns',
    symbol: 'Σ₂',
    emoji: '🏛️',
    filename: 'systemPatterns.md',
    description: 'Architecture, components, decisions',
    maxSize: 4096
  },
  techContext: {
    id: 'techContext',
    name: 'Technical Context',
    symbol: 'Σ₃',
    emoji: '💻',
    filename: 'techContext.md',
    description: 'Stack, environment, dependencies',
    maxSize: 3072
  },
  activeContext: {
    id: 'activeContext',
    name: 'Active Context',
    symbol: 'Σ₄',
    emoji: '🔮',
    filename: 'activeContext.md',
    description: 'Focus, changes, next steps',
    maxSize: 2048
  },
  progress: {
    id: 'progress',
    name: 'Progress Tracker',
    symbol: 'Σ₅',
    emoji: '📊',
    filename: 'progress.md',
    description: 'Status, milestones, issues',
    maxSize: 3072
  },
  protection: {
    id: 'protection',
    name: 'Protection Registry',
    symbol: 'Σ₆',
    emoji: '🛡️',
    filename: 'protection.md',
    description: 'Protected regions, history, approvals',
    maxSize: 2048
  }
};

export const PROTECTION_LEVELS: Record<string, ProtectionLevel> = {
  protected: {
    id: 1,
    name: 'PROTECTED',
    symbol: 'Ψ₁',
    emoji: '🔒',
    description: 'Highest - never modify'
  },
  guarded: {
    id: 2,
    name: 'GUARDED',
    symbol: 'Ψ₂',
    emoji: '🛡️',
    description: 'Ask before modifying'
  },
  info: {
    id: 3,
    name: 'INFO',
    symbol: 'Ψ₃',
    emoji: 'ℹ️',
    description: 'Context notes'
  },
  debug: {
    id: 4,
    name: 'DEBUG',
    symbol: 'Ψ₄',
    emoji: '🐛',
    description: 'Debugging code'
  },
  test: {
    id: 5,
    name: 'TEST',
    symbol: 'Ψ₅',
    emoji: '🧪',
    description: 'Testing code'
  },
  critical: {
    id: 6,
    name: 'CRITICAL',
    symbol: 'Ψ₆',
    emoji: '⚠️',
    description: 'Business logic'
  }
};

export function getMode(modeName: string): ModeDefinition | undefined {
  return MODES[modeName.toLowerCase()];
}

export function getPhase(phaseName: string): PhaseDefinition | undefined {
  return PHASES[phaseName.toLowerCase()];
}

export function getMemoryFile(fileId: string): MemoryFile | undefined {
  return MEMORY_FILES[fileId.toLowerCase()];
}

export function getProtectionLevel(levelId: number): ProtectionLevel | undefined {
  return Object.values(PROTECTION_LEVELS).find(level => level.id === levelId);
}
