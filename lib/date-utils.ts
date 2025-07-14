/**
 * Utility functions for consistent date formatting across server and client
 */

/**
 * Format a date consistently for display
 * @param date - Date object or ISO string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Use a consistent locale to avoid hydration mismatches
  return new Intl.DateTimeFormat('en-US', options).format(dateObj)
}

/**
 * Format a date for display in a short format (e.g., "Jan 15, 2025")
 */
export function formatDateShort(date: Date | string): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date for display in a long format (e.g., "January 15, 2025")
 */
export function formatDateLong(date: Date | string): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a number consistently for display
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}
