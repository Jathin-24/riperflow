import { describe, it, expect } from 'vitest';
import { GATES, GATE_ORDER, getGate, listGates, getNextGate, getPreviousGate, GateStage } from '../src/core/gates.js';

describe('Quality Gates', () => {
  describe('GATES', () => {
    it('should have 5 gates', () => {
      expect(Object.keys(GATES)).toHaveLength(5);
    });

    it('should have design gate', () => {
      expect(GATES.design).toBeDefined();
      expect(GATES.design.name).toBe('Design Review');
      expect(GATES.design.symbol).toBe('γ');
      expect(GATES.design.requiredApprovals).toContain('po');
      expect(GATES.design.requiredApprovals).toContain('architect');
    });

    it('should have development gate', () => {
      expect(GATES.development).toBeDefined();
      expect(GATES.development.autoAdvance).toBe(true);
    });

    it('should have testing gate', () => {
      expect(GATES.testing).toBeDefined();
      expect(GATES.testing.requiredApprovals).toContain('qa');
    });

    it('should have review gate', () => {
      expect(GATES.review).toBeDefined();
    });

    it('should have deploy gate', () => {
      expect(GATES.deploy).toBeDefined();
      expect(GATES.deploy.requiredApprovals).toContain('po');
      expect(GATES.deploy.requiredApprovals).toContain('devops');
    });
  });

  describe('GATE_ORDER', () => {
    it('should have correct order', () => {
      expect(GATE_ORDER).toEqual(['design', 'development', 'testing', 'review', 'deploy']);
    });
  });

  describe('getGate', () => {
    it('should return gate for valid id', () => {
      const gate = getGate('design');
      expect(gate).toBeDefined();
      expect(gate?.name).toBe('Design Review');
    });

    it('should return undefined for invalid id', () => {
      const gate = getGate('invalid');
      expect(gate).toBeUndefined();
    });
  });

  describe('listGates', () => {
    it('should return all gates', () => {
      const gates = listGates();
      expect(gates).toHaveLength(5);
    });
  });

  describe('getNextGate', () => {
    it('should return next gate from design', () => {
      const next = getNextGate('design');
      expect(next).toBe('development');
    });

    it('should return next gate from development', () => {
      const next = getNextGate('development');
      expect(next).toBe('testing');
    });

    it('should return null from deploy', () => {
      const next = getNextGate('deploy');
      expect(next).toBeNull();
    });

    it('should return null for invalid gate', () => {
      const next = getNextGate('invalid' as GateStage);
      expect(next).toBeNull();
    });
  });

  describe('getPreviousGate', () => {
    it('should return previous gate from development', () => {
      const prev = getPreviousGate('development');
      expect(prev).toBe('design');
    });

    it('should return null from design', () => {
      const prev = getPreviousGate('design');
      expect(prev).toBeNull();
    });
  });
});
