/**
 * Date Utilities
 *
 * CRITICAL: All date utilities in this file use LOCAL timezone, NOT UTC.
 * This ensures consistency across the app and prevents timezone bugs.
 */

/**
 * Parse a YYYY-MM-DD date string as LOCAL timezone (not UTC)
 * CRITICAL: JavaScript's `new Date("YYYY-MM-DD")` parses as UTC, which can
 * result in the wrong day when converted to local time.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object in LOCAL timezone at midnight
 *
 * @example
 * // In EST timezone (UTC-5):
 * new Date("2026-01-19").getDate() // Returns 18 (WRONG - UTC midnight = EST 7pm previous day)
 * parseLocalDate("2026-01-19").getDate() // Returns 19 (CORRECT)
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

/**
 * Format a Date object in YYYY-MM-DD format using LOCAL timezone
 * CRITICAL: Uses LOCAL timezone, NOT UTC
 *
 * This is the low-level function that all date formatting should use.
 * It extracts year/month/day using local timezone methods, NOT UTC.
 *
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format (e.g., "2025-01-22")
 *
 * @example
 * const someDate = new Date(2025, 0, 22); // Jan 22, 2025 local time
 * const formatted = formatLocalDate(someDate); // "2025-01-22"
 *
 * @note DO NOT use `date.toISOString().split('T')[0]` as it returns UTC date
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current local date in YYYY-MM-DD format
 * CRITICAL: Uses LOCAL timezone, NOT UTC
 *
 * This function is the canonical way to get "today's date" for:
 * - Bind completions
 * - Journal entries
 * - Dashboard queries
 * - All date-based operations
 *
 * @returns Date string in YYYY-MM-DD format (e.g., "2025-01-22")
 *
 * @example
 * const today = getCurrentLocalDate(); // "2025-01-22"
 *
 * @note DO NOT use `new Date().toISOString().split('T')[0]` as it returns UTC date
 */
export function getCurrentLocalDate(): string {
  return formatLocalDate(new Date());
}
