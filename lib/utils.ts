import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

/**
 * Merge class names with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a human-readable string (e.g. "March 8, 2026").
 */
export function formatDate(date: Date): string {
  return format(date, 'MMMM d, yyyy')
}

/**
 * Format a date as relative time (e.g. "2 days ago").
 */
export function formatRelativeDate(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Safely parse a JSON string into an array of segment strings.
 * Returns an empty array on failure.
 */
export function parseSegments(json: string): string[] {
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed) && parsed.every((s) => typeof s === 'string')) {
      return parsed
    }
    return []
  } catch {
    return []
  }
}

/**
 * Stringify an array of segments to JSON.
 */
export function stringifySegments(segments: string[]): string {
  return JSON.stringify(segments)
}
