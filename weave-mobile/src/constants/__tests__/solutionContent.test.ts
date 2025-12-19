/**
 * Tests for Solution Content Mapping
 * Story 1.4: Weave Solution Screen
 */

import {
  getSolutionContent,
  SOLUTION_TEXT,
  FALLBACK_SOLUTION,
  type PainpointId,
} from '../solutionContent';

describe('solutionContent', () => {
  describe('SOLUTION_TEXT', () => {
    it('should have all 4 painpoint solutions defined', () => {
      expect(Object.keys(SOLUTION_TEXT)).toHaveLength(4);
      expect(SOLUTION_TEXT).toHaveProperty('clarity');
      expect(SOLUTION_TEXT).toHaveProperty('action');
      expect(SOLUTION_TEXT).toHaveProperty('consistency');
      expect(SOLUTION_TEXT).toHaveProperty('alignment');
    });

    it('should have correct structure for each solution', () => {
      Object.values(SOLUTION_TEXT).forEach((solution) => {
        expect(solution).toHaveProperty('id');
        expect(solution).toHaveProperty('title');
        expect(solution).toHaveProperty('text');
        expect(typeof solution.id).toBe('string');
        expect(typeof solution.title).toBe('string');
        expect(typeof solution.text).toBe('string');
      });
    });

    it('should have non-empty text for all solutions', () => {
      Object.values(SOLUTION_TEXT).forEach((solution) => {
        expect(solution.title.length).toBeGreaterThan(0);
        expect(solution.text.length).toBeGreaterThan(0);
      });
    });

    it('should have painpoint name as title (Clarity, Action, etc.)', () => {
      expect(SOLUTION_TEXT.clarity.title).toBe('Clarity');
      expect(SOLUTION_TEXT.action.title).toBe('Action');
      expect(SOLUTION_TEXT.consistency.title).toBe('Consistency');
      expect(SOLUTION_TEXT.alignment.title).toBe('Alignment');
    });
  });

  describe('getSolutionContent', () => {
    it('should return correct solution for single painpoint', () => {
      const result = getSolutionContent(['clarity']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('clarity');
      expect(result[0].text).toContain('clear direction');
    });

    it('should return correct solutions for two painpoints', () => {
      const result = getSolutionContent(['clarity', 'action']);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('clarity');
      expect(result[1].id).toBe('action');
    });

    it('should filter out invalid painpoint IDs', () => {
      const result = getSolutionContent(['clarity', 'invalid', 'action']);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('clarity');
      expect(result[1].id).toBe('action');
    });

    it('should return empty array for all invalid painpoints', () => {
      const result = getSolutionContent(['invalid1', 'invalid2']);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for empty input', () => {
      const result = getSolutionContent([]);
      expect(result).toHaveLength(0);
    });

    it('should preserve order of painpoints', () => {
      const result = getSolutionContent(['consistency', 'clarity', 'action']);
      expect(result[0].id).toBe('consistency');
      expect(result[1].id).toBe('clarity');
      expect(result[2].id).toBe('action');
    });

    it('should handle all 4 painpoints correctly', () => {
      const painpoints: PainpointId[] = ['clarity', 'action', 'consistency', 'alignment'];
      painpoints.forEach((id) => {
        const result = getSolutionContent([id]);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(id);
        expect(result[0]).toEqual(SOLUTION_TEXT[id]);
      });
    });
  });

  describe('FALLBACK_SOLUTION', () => {
    it('should have correct structure', () => {
      expect(FALLBACK_SOLUTION).toHaveProperty('id');
      expect(FALLBACK_SOLUTION).toHaveProperty('title');
      expect(FALLBACK_SOLUTION).toHaveProperty('text');
    });

    it('should have non-empty text', () => {
      expect(FALLBACK_SOLUTION.title.length).toBeGreaterThan(0);
      expect(FALLBACK_SOLUTION.text.length).toBeGreaterThan(0);
    });

    it('should have generic title "How Weave helps"', () => {
      expect(FALLBACK_SOLUTION.title).toBe('How Weave helps');
    });

    it('should have fallback id', () => {
      expect(FALLBACK_SOLUTION.id).toBe('clarity');
    });
  });

  describe('Content Quality', () => {
    it('should have solutions between 3-5 lines (PRD requirement)', () => {
      Object.values(SOLUTION_TEXT).forEach((solution) => {
        const lines = solution.text.split('. ').length;
        // Approximately 2-3 sentences (3-5 lines when wrapped)
        expect(lines).toBeGreaterThanOrEqual(2);
        expect(lines).toBeLessThanOrEqual(4);
      });
    });

    it('should have brief, actionable content', () => {
      Object.values(SOLUTION_TEXT).forEach((solution) => {
        // Max ~200 characters per solution for brevity
        expect(solution.text.length).toBeLessThanOrEqual(250);
        expect(solution.text.length).toBeGreaterThan(50);
      });
    });
  });
});
