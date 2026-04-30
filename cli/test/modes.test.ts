import { describe, it, expect, beforeEach } from 'vitest';
import { MODES, PHASES, MEMORY_FILES, PROTECTION_LEVELS, getMode, getPhase, getMemoryFile } from '../src/core/modes.js';

describe('Core Modes', () => {
  describe('MODES', () => {
    it('should have 5 modes', () => {
      expect(Object.keys(MODES)).toHaveLength(5);
    });

    it('should have research mode', () => {
      expect(MODES.research).toBeDefined();
      expect(MODES.research.symbol).toBe('Ω₁');
      expect(MODES.research.permissions.read).toBe(true);
      expect(MODES.research.permissions.create).toBe(false);
    });

    it('should have innovate mode', () => {
      expect(MODES.innovate).toBeDefined();
      expect(MODES.innovate.symbol).toBe('Ω₂');
    });

    it('should have plan mode', () => {
      expect(MODES.plan).toBeDefined();
      expect(MODES.plan.symbol).toBe('Ω₃');
    });

    it('should have execute mode', () => {
      expect(MODES.execute).toBeDefined();
      expect(MODES.execute.symbol).toBe('Ω₄');
      expect(MODES.execute.permissions.delete).toBe(true);
    });

    it('should have review mode', () => {
      expect(MODES.review).toBeDefined();
      expect(MODES.review.symbol).toBe('Ω₅');
    });
  });

  describe('PHASES', () => {
    it('should have 4 phases', () => {
      expect(Object.keys(PHASES)).toHaveLength(4);
    });

    it('should have uninitiated phase', () => {
      expect(PHASES.uninitiated).toBeDefined();
      expect(PHASES.uninitiated.symbol).toBe('Π₁');
    });

    it('should have initializing phase', () => {
      expect(PHASES.initializing).toBeDefined();
    });

    it('should have development phase', () => {
      expect(PHASES.development).toBeDefined();
    });

    it('should have maintenance phase', () => {
      expect(PHASES.maintenance).toBeDefined();
    });
  });

  describe('MEMORY_FILES', () => {
    it('should have 6 memory files', () => {
      expect(Object.keys(MEMORY_FILES)).toHaveLength(6);
    });

    it('should have projectbrief', () => {
      expect(MEMORY_FILES.projectbrief).toBeDefined();
      expect(MEMORY_FILES.projectbrief.symbol).toBe('Σ₁');
    });

    it('should have systemPatterns', () => {
      expect(MEMORY_FILES.systemPatterns).toBeDefined();
      expect(MEMORY_FILES.systemPatterns.symbol).toBe('Σ₂');
    });

    it('should have techContext', () => {
      expect(MEMORY_FILES.techContext).toBeDefined();
    });

    it('should have activeContext', () => {
      expect(MEMORY_FILES.activeContext).toBeDefined();
    });

    it('should have progress', () => {
      expect(MEMORY_FILES.progress).toBeDefined();
    });

    it('should have protection', () => {
      expect(MEMORY_FILES.protection).toBeDefined();
    });
  });

  describe('PROTECTION_LEVELS', () => {
    it('should have 6 protection levels', () => {
      expect(Object.keys(PROTECTION_LEVELS)).toHaveLength(6);
    });
  });

  describe('getMode', () => {
    it('should return mode for valid name', () => {
      const mode = getMode('research');
      expect(mode).toBeDefined();
      expect(mode?.name).toBe('Research');
    });

    it('should return undefined for invalid name', () => {
      const mode = getMode('invalid');
      expect(mode).toBeUndefined();
    });
  });

  describe('getPhase', () => {
    it('should return phase for valid name', () => {
      const phase = getPhase('uninitiated');
      expect(phase).toBeDefined();
      expect(phase?.name).toBe('UNINITIATED');
    });

    it('should return undefined for invalid name', () => {
      const phase = getPhase('invalid');
      expect(phase).toBeUndefined();
    });
  });

  describe('getMemoryFile', () => {
    it('should return memory file for valid id', () => {
      const file = getMemoryFile('projectbrief');
      expect(file).toBeDefined();
      expect(file?.filename).toBe('projectbrief.md');
    });

    it('should return undefined for invalid id', () => {
      const file = getMemoryFile('invalid');
      expect(file).toBeUndefined();
    });
  });
});
