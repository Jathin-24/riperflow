import { describe, it, expect } from 'vitest';
import { ROLES, getRole, listRoles, getRolePermissions, Role } from '../src/core/roles.js';

describe('Roles', () => {
  describe('ROLES', () => {
    it('should have 5 roles', () => {
      expect(Object.keys(ROLES)).toHaveLength(5);
    });

    it('should have Product Owner role', () => {
      expect(ROLES.po).toBeDefined();
      expect(ROLES.po.name).toBe('Product Owner');
      expect(ROLES.po.symbol).toBe('α');
      expect(ROLES.po.permissions.read).toBe(true);
      expect(ROLES.po.permissions.approve).toBe(true);
    });

    it('should have Architect role', () => {
      expect(ROLES.architect).toBeDefined();
      expect(ROLES.architect.symbol).toBe('Ω');
      expect(ROLES.architect.permissions.delete).toBe(true);
    });

    it('should have Developer role', () => {
      expect(ROLES.dev).toBeDefined();
      expect(ROLES.dev.permissions.write).toBe(true);
      expect(ROLES.dev.permissions.deploy).toBe(false);
    });

    it('should have QA role', () => {
      expect(ROLES.qa).toBeDefined();
      expect(ROLES.qa.permissions.write).toBe(false);
      expect(ROLES.qa.permissions.approve).toBe(true);
    });

    it('should have DevOps role', () => {
      expect(ROLES.devops).toBeDefined();
      expect(ROLES.devops.permissions.deploy).toBe(true);
    });
  });

  describe('getRole', () => {
    it('should return role for valid id', () => {
      const role = getRole('po');
      expect(role).toBeDefined();
      expect(role?.name).toBe('Product Owner');
    });

    it('should return undefined for invalid id', () => {
      const role = getRole('invalid');
      expect(role).toBeUndefined();
    });
  });

  describe('listRoles', () => {
    it('should return all roles', () => {
      const roles = listRoles();
      expect(roles).toHaveLength(5);
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions for valid role', () => {
      const perms = getRolePermissions('po');
      expect(perms).toBeDefined();
      expect(perms?.read).toBe(true);
    });

    it('should return undefined for invalid role', () => {
      const perms = getRolePermissions('invalid');
      expect(perms).toBeUndefined();
    });
  });
});
