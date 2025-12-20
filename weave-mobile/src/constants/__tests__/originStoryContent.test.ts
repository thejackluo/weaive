/**
 * Unit Tests for Origin Story Content Generation
 * Story 1.7: Commitment Ritual & Origin Story
 *
 * RED PHASE: These tests will FAIL until originStoryContent.ts is implemented
 *
 * Tests dynamic narrative generation based on:
 * - User's selected painpoints (from Story 1.2)
 * - User's identity traits (from Story 1.6)
 */

import {
  generateNarrativeText,
  PAINPOINT_STRUGGLES,
  type PainpointId,
} from '../originStoryContent';

describe('originStoryContent', () => {
  describe('PAINPOINT_STRUGGLES constant', () => {
    // GIVEN: PAINPOINT_STRUGGLES is defined
    // THEN: It should have all 4 painpoint mappings
    it('should have all 4 painpoint struggle texts defined', () => {
      expect(Object.keys(PAINPOINT_STRUGGLES)).toHaveLength(4);
      expect(PAINPOINT_STRUGGLES).toHaveProperty('clarity');
      expect(PAINPOINT_STRUGGLES).toHaveProperty('action');
      expect(PAINPOINT_STRUGGLES).toHaveProperty('consistency');
      expect(PAINPOINT_STRUGGLES).toHaveProperty('alignment');
    });

    // GIVEN: Each painpoint has a struggle text
    // THEN: All struggle texts should be non-empty strings
    it('should have non-empty struggle text for each painpoint', () => {
      Object.values(PAINPOINT_STRUGGLES).forEach((struggleText) => {
        expect(typeof struggleText).toBe('string');
        expect(struggleText.length).toBeGreaterThan(20);
      });
    });

    // GIVEN: Clarity painpoint selected
    // THEN: Struggle text should mention "scattered" or "direction"
    it('should have clarity struggle mentioning scattered/direction', () => {
      const clarityText = PAINPOINT_STRUGGLES.clarity;
      expect(clarityText.toLowerCase()).toMatch(/scattered|direction|clear/);
    });

    // GIVEN: Action painpoint selected
    // THEN: Struggle text should mention taking action
    it('should have action struggle mentioning taking action', () => {
      const actionText = PAINPOINT_STRUGGLES.action;
      expect(actionText.toLowerCase()).toMatch(/action|taking|consistent/);
    });

    // GIVEN: Consistency painpoint selected
    // THEN: Struggle text should mention momentum or cycle
    it('should have consistency struggle mentioning momentum/cycle', () => {
      const consistencyText = PAINPOINT_STRUGGLES.consistency;
      expect(consistencyText.toLowerCase()).toMatch(/momentum|cycle|fade/);
    });

    // GIVEN: Alignment painpoint selected
    // THEN: Struggle text should mention alignment or purpose
    it('should have alignment struggle mentioning alignment/purpose', () => {
      const alignmentText = PAINPOINT_STRUGGLES.alignment;
      expect(alignmentText.toLowerCase()).toMatch(/alignment|purpose|busy|life/);
    });
  });

  describe('generateNarrativeText', () => {
    // GIVEN: Single painpoint and single trait
    // WHEN: Generating narrative
    // THEN: Should return object with struggle, aspiration, bridge
    it('should return correct structure with all 3 components', () => {
      const result = generateNarrativeText(['clarity'], ['Disciplined']);

      expect(result).toHaveProperty('struggle');
      expect(result).toHaveProperty('aspiration');
      expect(result).toHaveProperty('bridge');
      expect(typeof result.struggle).toBe('string');
      expect(typeof result.aspiration).toBe('string');
      expect(typeof result.bridge).toBe('string');
    });

    // GIVEN: Clarity painpoint
    // WHEN: Generating struggle text
    // THEN: Should include clarity struggle text
    it('should generate struggle text for single painpoint', () => {
      const result = generateNarrativeText(['clarity'], ['Focused']);

      expect(result.struggle).toContain('scattered');
      expect(result.struggle.length).toBeGreaterThan(20);
    });

    // GIVEN: Multiple painpoints (clarity, action)
    // WHEN: Generating struggle text
    // THEN: Should combine both struggle texts
    it('should combine struggle texts for multiple painpoints', () => {
      const result = generateNarrativeText(['clarity', 'action'], ['Focused']);

      expect(result.struggle).toContain('scattered');
      expect(result.struggle).toContain('action');
    });

    // GIVEN: Identity traits ["Disciplined", "Confident", "Intentional"]
    // WHEN: Generating aspiration text
    // THEN: Should mention all traits
    it('should generate aspiration text with identity traits', () => {
      const result = generateNarrativeText(
        ['clarity'],
        ['Disciplined', 'Confident', 'Intentional']
      );

      expect(result.aspiration).toContain('Disciplined');
      expect(result.aspiration).toContain('Confident');
      expect(result.aspiration).toContain('Intentional');
    });

    // GIVEN: More than 3 identity traits
    // WHEN: Generating aspiration text
    // THEN: Should use first 3 traits only (per Story 1.7 AC #2)
    it('should limit aspiration to first 3 traits when >3 provided', () => {
      const result = generateNarrativeText(
        ['clarity'],
        ['Disciplined', 'Confident', 'Intentional', 'Focused', 'Creative']
      );

      expect(result.aspiration).toContain('Disciplined');
      expect(result.aspiration).toContain('Confident');
      expect(result.aspiration).toContain('Intentional');
      expect(result.aspiration).not.toContain('Focused');
      expect(result.aspiration).not.toContain('Creative');
    });

    // GIVEN: Bridge statement
    // WHEN: Generating narrative
    // THEN: Should include "Weave" and "begin"
    it('should generate bridge statement mentioning Weave', () => {
      const result = generateNarrativeText(['clarity'], ['Disciplined']);

      expect(result.bridge).toContain('Weave');
      expect(result.bridge.toLowerCase()).toMatch(/begin|start|first/);
    });

    // GIVEN: Empty painpoints array
    // WHEN: Generating narrative
    // THEN: Should return generic struggle text or empty string
    it('should handle empty painpoints gracefully', () => {
      const result = generateNarrativeText([], ['Disciplined']);

      expect(result.struggle).toBeDefined();
      expect(typeof result.struggle).toBe('string');
      // Either empty or generic fallback text
    });

    // GIVEN: Empty identity traits array
    // WHEN: Generating aspiration
    // THEN: Should return generic aspiration or handle gracefully
    it('should handle empty identity traits gracefully', () => {
      const result = generateNarrativeText(['clarity'], []);

      expect(result.aspiration).toBeDefined();
      expect(typeof result.aspiration).toBe('string');
    });

    // GIVEN: Invalid painpoint ID
    // WHEN: Generating narrative
    // THEN: Should filter out invalid IDs and not crash
    it('should filter out invalid painpoint IDs without crashing', () => {
      const result = generateNarrativeText(
        ['clarity', 'invalid', 'action'] as PainpointId[],
        ['Disciplined']
      );

      expect(result.struggle).toBeDefined();
      expect(result.struggle).toContain('scattered');
      expect(result.struggle).toContain('action');
    });

    // GIVEN: All 4 painpoints selected
    // WHEN: Generating struggle text
    // THEN: Should combine all 4 struggle texts
    it('should combine all 4 painpoint struggles when all selected', () => {
      const allPainpoints: PainpointId[] = ['clarity', 'action', 'consistency', 'alignment'];
      const result = generateNarrativeText(allPainpoints, ['Disciplined']);

      // Should contain keywords from all 4 painpoints
      expect(result.struggle.toLowerCase()).toMatch(/scattered|direction/);
      expect(result.struggle.toLowerCase()).toMatch(/action|taking/);
      expect(result.struggle.toLowerCase()).toMatch(/momentum|cycle/);
      expect(result.struggle.toLowerCase()).toMatch(/alignment|busy/);
    });
  });

  describe('Content Quality Requirements (AC #3)', () => {
    // GIVEN: Generated narrative text
    // THEN: Should be appropriate length (not too short, not too long)
    it('should generate struggle text with reasonable length', () => {
      const result = generateNarrativeText(['clarity', 'action'], ['Disciplined']);

      // Reasonable sentence length (50-300 chars)
      expect(result.struggle.length).toBeGreaterThan(50);
      expect(result.struggle.length).toBeLessThan(300);
    });

    // GIVEN: Generated aspiration text
    // THEN: Should be concise and actionable
    it('should generate aspiration text with reasonable length', () => {
      const result = generateNarrativeText(['clarity'], ['Disciplined', 'Confident']);

      // Reasonable sentence length (30-150 chars)
      expect(result.aspiration.length).toBeGreaterThan(30);
      expect(result.aspiration.length).toBeLessThan(150);
    });

    // GIVEN: Generated bridge text
    // THEN: Should be brief and motivating
    it('should generate bridge text with reasonable length', () => {
      const result = generateNarrativeText(['clarity'], ['Disciplined']);

      // Brief statement (30-120 chars)
      expect(result.bridge.length).toBeGreaterThan(30);
      expect(result.bridge.length).toBeLessThan(120);
    });
  });

  describe('Performance Requirements (AC #6)', () => {
    // GIVEN: Content generation called
    // WHEN: Generating narrative
    // THEN: Should complete in <100ms (deterministic, no async)
    it('should generate content in <100ms', () => {
      const startTime = Date.now();

      generateNarrativeText(['clarity', 'action'], ['Disciplined', 'Confident']);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
    });

    // GIVEN: Large number of calls
    // WHEN: Generating narratives repeatedly
    // THEN: Should maintain consistent performance
    it('should maintain consistent performance across multiple calls', () => {
      const durations: number[] = [];

      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        generateNarrativeText(['clarity'], ['Disciplined']);
        durations.push(Date.now() - startTime);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(avgDuration).toBeLessThan(50); // Average should be very fast
    });
  });
});

/**
 * Integration Test Notes
 *
 * These unit tests cover the content generation logic.
 * Component-level tests (origin-story.test.tsx) will verify:
 * - AsyncStorage data retrieval
 * - Dynamic content display in Screen 1
 * - Navigation between screens
 *
 * Manual device tests will verify:
 * - Camera capture functionality
 * - Microphone recording functionality
 * - Permissions flow
 */
