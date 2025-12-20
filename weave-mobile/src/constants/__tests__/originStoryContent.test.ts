/**
 * Tests for Origin Story Content Generation
 * Story 1.7: Commitment Ritual & Origin Story
 */

import {
  generateNarrativeText,
  generateFromToSummary,
  PAINPOINT_STRUGGLES,
  VOICE_PROMPTS,
} from '../originStoryContent';

describe('originStoryContent', () => {
  describe('PAINPOINT_STRUGGLES', () => {
    it('should have struggle text for all painpoint keys', () => {
      expect(PAINPOINT_STRUGGLES.clarity).toBeDefined();
      expect(PAINPOINT_STRUGGLES.action).toBeDefined();
      expect(PAINPOINT_STRUGGLES.consistency).toBeDefined();
      expect(PAINPOINT_STRUGGLES.alignment).toBeDefined();
    });

    it('should have non-empty struggle text for each painpoint', () => {
      Object.values(PAINPOINT_STRUGGLES).forEach((text) => {
        expect(text.length).toBeGreaterThan(0);
      });
    });
  });

  describe('VOICE_PROMPTS', () => {
    it('should have exactly 3 voice prompts', () => {
      expect(VOICE_PROMPTS).toHaveLength(3);
    });

    it('should have non-empty prompts', () => {
      VOICE_PROMPTS.forEach((prompt) => {
        expect(prompt.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateNarrativeText', () => {
    it('should generate narrative text with single painpoint', () => {
      const painpoints = ['clarity'];
      const identityTraits = ['Disciplined', 'Focused', 'Intentional'];

      const result = generateNarrativeText(painpoints, identityTraits);

      expect(result.struggle).toContain(PAINPOINT_STRUGGLES.clarity);
      expect(result.aspiration).toContain('Disciplined');
      expect(result.aspiration).toContain('Focused');
      expect(result.aspiration).toContain('Intentional');
      expect(result.bridge).toContain('Weave');
    });

    it('should generate narrative text with multiple painpoints', () => {
      const painpoints = ['clarity', 'action'];
      const identityTraits = ['Confident', 'Bold'];

      const result = generateNarrativeText(painpoints, identityTraits);

      expect(result.struggle).toContain(PAINPOINT_STRUGGLES.clarity);
      expect(result.struggle).toContain(PAINPOINT_STRUGGLES.action);
      expect(result.aspiration).toContain('Confident');
      expect(result.aspiration).toContain('Bold');
    });

    it('should handle more than 3 identity traits by using first 3', () => {
      const painpoints = ['clarity'];
      const identityTraits = ['Disciplined', 'Focused', 'Intentional', 'Confident', 'Bold'];

      const result = generateNarrativeText(painpoints, identityTraits);

      expect(result.aspiration).toContain('Disciplined');
      expect(result.aspiration).toContain('Focused');
      expect(result.aspiration).toContain('Intentional');
    });

    it('should return fallback text when painpoints are empty', () => {
      const painpoints: string[] = [];
      const identityTraits = ['Disciplined'];

      const result = generateNarrativeText(painpoints, identityTraits);

      expect(result.struggle).toContain('ready for a change');
      expect(result.aspiration).toContain('Disciplined');
    });

    it('should always include bridge statement', () => {
      const painpoints = ['clarity'];
      const identityTraits = ['Disciplined'];

      const result = generateNarrativeText(painpoints, identityTraits);

      expect(result.bridge).toBe(
        'Weave helps you turn that vision into reality, one small bind at a time. This is where you begin.'
      );
    });
  });

  describe('generateFromToSummary', () => {
    it('should generate from/to summary with first painpoint', () => {
      const painpoints = ['clarity', 'action'];
      const identityTraits = ['Disciplined', 'Focused'];

      const result = generateFromToSummary(painpoints, identityTraits);

      expect(result.fromText).toBe(PAINPOINT_STRUGGLES.clarity);
      expect(result.toText).toContain('Disciplined');
      expect(result.toText).toContain('Focused');
    });

    it('should handle up to 5 identity traits', () => {
      const painpoints = ['clarity'];
      const identityTraits = ['Disciplined', 'Focused', 'Intentional', 'Confident', 'Bold'];

      const result = generateFromToSummary(painpoints, identityTraits);

      expect(result.toText).toBe('Disciplined, Focused, Intentional, Confident, Bold');
    });
  });
});
