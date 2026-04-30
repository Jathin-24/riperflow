export type Role = 'po' | 'architect' | 'dev' | 'qa' | 'devops';

export interface RoleDefinition {
  id: Role;
  name: string;
  symbol: string;
  emoji: string;
  description: string;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    deploy: boolean;
    approve: boolean;
  };
}

export const ROLES: Record<Role, RoleDefinition> = {
  po: {
    id: 'po',
    name: 'Product Owner',
    symbol: 'α',
    emoji: '👑',
    description: 'Owns product vision and priorities',
    permissions: {
      read: true,
      write: true,
      delete: false,
      deploy: false,
      approve: true
    }
  },
  architect: {
    id: 'architect',
    name: 'Architect',
    symbol: 'Ω',
    emoji: '🏗️',
    description: 'Defines technical decisions and patterns',
    permissions: {
      read: true,
      write: true,
      delete: true,
      deploy: false,
      approve: true
    }
  },
  dev: {
    id: 'dev',
    name: 'Developer',
    symbol: 'δ',
    emoji: '💻',
    description: 'Implements features and fixes',
    permissions: {
      read: true,
      write: true,
      delete: false,
      deploy: false,
      approve: false
    }
  },
  qa: {
    id: 'qa',
    name: 'QA Engineer',
    symbol: 'ψ',
    emoji: '🧪',
    description: 'Validates quality and testing',
    permissions: {
      read: true,
      write: false,
      delete: false,
      deploy: false,
      approve: true
    }
  },
  devops: {
    id: 'devops',
    name: 'DevOps',
    symbol: 'λ',
    emoji: '🔧',
    description: 'Manages deployments and infrastructure',
    permissions: {
      read: true,
      write: true,
      delete: true,
      deploy: true,
      approve: false
    }
  }
};

export function getRole(roleId: string): RoleDefinition | undefined {
  return ROLES[roleId as Role];
}

export function listRoles(): RoleDefinition[] {
  return Object.values(ROLES);
}

export function getRolePermissions(roleId: string): RoleDefinition['permissions'] | undefined {
  const role = getRole(roleId);
  return role?.permissions;
}
