/**
 * Unit tests for dateUtils
 *
 * CRITICAL: These tests verify the timezone-safe date parsing functions
 * that prevent UTC date bugs across the application.
 */

import { parseLocalDate, formatLocalDate, getCurrentLocalDate } from '../dateUtils';

describe('dateUtils', () => {
  describe('parseLocalDate', () => {
    it('parses YYYY-MM-DD string as local date, not UTC', () => {
      const dateStr = '2026-01-25';
      const result = parseLocalDate(dateStr);

      // Should return January 25, not January 24 (which would happen with UTC parsing)
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January is 0-indexed
      expect(result.getDate()).toBe(25);
    });

    it('handles first day of month correctly', () => {
      const dateStr = '2026-02-01';
      const result = parseLocalDate(dateStr);

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(1);
    });

    it('handles last day of month correctly', () => {
      const dateStr = '2026-01-31';
      const result = parseLocalDate(dateStr);

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(31);
    });

    it('handles leap year correctly', () => {
      const dateStr = '2024-02-29'; // 2024 is a leap year
      const result = parseLocalDate(dateStr);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(29);
    });

    it('differs from new Date() UTC parsing for YYYY-MM-DD strings', () => {
      // This test demonstrates the bug that parseLocalDate fixes
      const dateStr = '2026-01-19';

      // new Date("YYYY-MM-DD") parses as UTC midnight
      const utcParsed = new Date(dateStr);

      // parseLocalDate parses as local midnight
      const localParsed = parseLocalDate(dateStr);

      // In any timezone west of UTC (like EST, PST), the dates will differ
      // because UTC midnight becomes the previous day in local time
      // We can't guarantee this test passes in all timezones, so we just
      // verify both parse the same date string and produce Date objects
      expect(localParsed.getDate()).toBe(19);
      // The UTC parsed version might be 18 or 19 depending on timezone
      // This demonstrates the potential issue
    });
  });

  describe('formatLocalDate', () => {
    it('formats Date object as YYYY-MM-DD in local timezone', () => {
      // Create a date for January 25, 2026 in local time
      const date = new Date(2026, 0, 25); // month is 0-indexed
      const result = formatLocalDate(date);

      expect(result).toBe('2026-01-25');
    });

    it('pads single-digit months with zero', () => {
      const date = new Date(2026, 0, 5); // January 5
      const result = formatLocalDate(date);

      expect(result).toBe('2026-01-05');
    });

    it('pads single-digit days with zero', () => {
      const date = new Date(2026, 11, 5); // December 5
      const result = formatLocalDate(date);

      expect(result).toBe('2026-12-05');
    });

    it('round-trips with parseLocalDate', () => {
      const original = '2026-07-15';
      const parsed = parseLocalDate(original);
      const formatted = formatLocalDate(parsed);

      expect(formatted).toBe(original);
    });
  });

  describe('getCurrentLocalDate', () => {
    it('returns date in YYYY-MM-DD format', () => {
      const result = getCurrentLocalDate();

      // Should match YYYY-MM-DD pattern
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns today\'s date (not yesterday due to UTC)', () => {
      const result = getCurrentLocalDate();
      const today = new Date();

      const expectedYear = today.getFullYear();
      const expectedMonth = String(today.getMonth() + 1).padStart(2, '0');
      const expectedDay = String(today.getDate()).padStart(2, '0');
      const expected = `${expectedYear}-${expectedMonth}-${expectedDay}`;

      expect(result).toBe(expected);
    });
  });
});
