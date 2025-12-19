/**
 * Tests for symptom content mapping
 * Story 1.3: Symptom Insight Screen
 */

import {
  SYMPTOM_TEXT,
  getSymptomContent,
  FALLBACK_SYMPTOM,
  type PainpointId,
} from '../symptomContent';

describe('symptomContent', () => {
  describe('SYMPTOM_TEXT', () => {
    it('should contain all 4 painpoint categories', () => {
      expect(Object.keys(SYMPTOM_TEXT)).toHaveLength(4);
      expect(SYMPTOM_TEXT).toHaveProperty('clarity');
      expect(SYMPTOM_TEXT).toHaveProperty('action');
      expect(SYMPTOM_TEXT).toHaveProperty('consistency');
      expect(SYMPTOM_TEXT).toHaveProperty('alignment');
    });

    it('should have correct structure for each symptom', () => {
      const painpoints: PainpointId[] = ['clarity', 'action', 'consistency', 'alignment'];

      painpoints.forEach((id) => {
        expect(SYMPTOM_TEXT[id]).toHaveProperty('id', id);
        expect(SYMPTOM_TEXT[id]).toHaveProperty('title');
        expect(SYMPTOM_TEXT[id]).toHaveProperty('text');
        expect(SYMPTOM_TEXT[id].text).toBeTruthy();
        expect(SYMPTOM_TEXT[id].text.length).toBeGreaterThan(50);
      });
    });

    it('should match PRD copy for clarity symptom', () => {
      expect(SYMPTOM_TEXT.clarity.text).toContain('You want direction');
      expect(SYMPTOM_TEXT.clarity.text).toContain('closing every other door');
    });

    it('should match PRD copy for action symptom', () => {
      expect(SYMPTOM_TEXT.action.text).toContain('Your mind runs laps');
      expect(SYMPTOM_TEXT.action.text).toContain('hesitation becomes your default');
    });

    it('should match PRD copy for consistency symptom', () => {
      expect(SYMPTOM_TEXT.consistency.text).toContain('You start strong');
      expect(SYMPTOM_TEXT.consistency.text).toContain('motivation collapses');
    });

    it('should match PRD copy for alignment symptom', () => {
      expect(SYMPTOM_TEXT.alignment.text).toContain("You're ambitious");
      expect(SYMPTOM_TEXT.alignment.text).toContain('shrinking yourself');
    });
  });

  describe('getSymptomContent', () => {
    it('should return single symptom for one painpoint', () => {
      const result = getSymptomContent(['clarity']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('clarity');
    });

    it('should return two symptoms for two painpoints', () => {
      const result = getSymptomContent(['clarity', 'action']);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('clarity');
      expect(result[1].id).toBe('action');
    });

    it('should filter out invalid painpoint IDs', () => {
      const result = getSymptomContent(['clarity', 'invalid', 'action']);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('clarity');
      expect(result[1].id).toBe('action');
    });

    it('should return empty array for empty input', () => {
      const result = getSymptomContent([]);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for all invalid IDs', () => {
      const result = getSymptomContent(['invalid1', 'invalid2']);
      expect(result).toHaveLength(0);
    });

    it('should preserve order of painpoints', () => {
      const result1 = getSymptomContent(['action', 'clarity']);
      expect(result1[0].id).toBe('action');
      expect(result1[1].id).toBe('clarity');

      const result2 = getSymptomContent(['clarity', 'action']);
      expect(result2[0].id).toBe('clarity');
      expect(result2[1].id).toBe('action');
    });
  });

  describe('FALLBACK_SYMPTOM', () => {
    it('should have fallback text for edge cases', () => {
      expect(FALLBACK_SYMPTOM).toHaveProperty('id');
      expect(FALLBACK_SYMPTOM).toHaveProperty('title');
      expect(FALLBACK_SYMPTOM).toHaveProperty('text');
      expect(FALLBACK_SYMPTOM.text).toContain("Let's explore");
    });
  });
});
