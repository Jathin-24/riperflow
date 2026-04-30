import { describe, it, expect } from 'vitest';
import {
  canPerformOperation,
  checkProtectionLevel,
  validateOperation,
  getEnforcementSummary,
  type OperationRequest
} from '../src/core/enforcer.js';
import type { ProtectionLevel } from '../src/core/protection.js';

describe('Enforcer', () => {
  describe('canPerformOperation', () => {
    it('should allow read in research mode', () => {
      const request: OperationRequest = {
        action: 'read',
        path: 'src/test.ts',
        currentMode: 'research'
      };
      const result = canPerformOperation(request);
      expect(result.allowed).toBe(true);
    });

    it('should deny write in research mode', () => {
      const request: OperationRequest = {
        action: 'write',
        path: 'src/test.ts',
        currentMode: 'research'
      };
      const result = canPerformOperation(request);
      expect(result.allowed).toBe(false);
      expect(result.violations?.length).toBeGreaterThan(0);
    });

    it('should allow all operations in execute mode', () => {
      const readRequest: OperationRequest = {
        action: 'read',
        path: 'src/test.ts',
        currentMode: 'execute'
      };
      const writeRequest: OperationRequest = {
        action: 'write',
        path: 'src/test.ts',
        currentMode: 'execute'
      };
      
      expect(canPerformOperation(readRequest).allowed).toBe(true);
      expect(canPerformOperation(writeRequest).allowed).toBe(true);
    });
  });

  describe('checkProtectionLevel', () => {
    it('should block modifications on locked files', () => {
      const registry: Record<string, ProtectionLevel> = { 'src/core/locked.ts': 'locked' };
      const result = checkProtectionLevel('src/core/locked.ts', 'write', registry);
      expect(result.allowed).toBe(false);
      expect(result.requiresApproval).toBe(true);
    });

    it('should allow read on any protection level', () => {
      const registry: Record<string, ProtectionLevel> = { 'file.ts': 'frozen' };
      const result = checkProtectionLevel('file.ts', 'read', registry);
      expect(result.allowed).toBe(true);
    });

    it('should require confirmation for review level', () => {
      const registry: Record<string, ProtectionLevel> = { 'file.ts': 'review' };
      const result = checkProtectionLevel('file.ts', 'write', registry);
      expect(result.allowed).toBe(true);
      expect(result.requiresApproval).toBe(true);
    });
  });

  describe('validateOperation', () => {
    it('should validate a complete operation', () => {
      const request: OperationRequest = {
        action: 'write',
        currentMode: 'execute',
        currentRole: 'dev',
        path: 'src/test.ts'
      };

      const result = validateOperation(request);
      expect(result.allowed).toBe(true);
    });

    it('should reject unauthorized write', () => {
      const request: OperationRequest = {
        action: 'write',
        currentMode: 'research',
        currentRole: 'dev',
        path: 'src/test.ts'
      };

      const result = validateOperation(request);
      expect(result.allowed).toBe(false);
      expect(result.violations?.length).toBeGreaterThan(0);
    });

    it('should respect protection levels', () => {
      const request: OperationRequest = {
        action: 'write',
        currentMode: 'execute',
        currentRole: 'dev',
        path: 'src/locked.ts'
      };

      const registry: Record<string, ProtectionLevel> = { 'src/locked.ts': 'locked' };
      const result = validateOperation(request, {
        protectionRegistry: registry
      });

      expect(result.allowed).toBe(false);
    });
  });
});
