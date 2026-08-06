/**
 * @fileoverview Utility functions for the portfolio application
 *
 * This module provides common utility functions used throughout the app,
 * including className merging for Tailwind CSS.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `basePath` and `withBasePath` now live in `@/lib/basePath`, which imports
 * nothing.
 *
 * They were declared here, above `cn()`, and that put the two lines above this
 * comment into the dependency graph of everything that needed a URL prefix —
 * including `personal.ts`, and therefore the run's own nameplate build, which
 * `tsc -p tsconfig.run.json` could not compile once those packages were gone.
 *
 * Re-exported rather than moved-and-repointed everywhere: the React tree still
 * imports them from here, and it is being deleted in the next phase. Rewiring
 * a doomed tree is churn with a nonzero chance of moving a shipped page. The
 * surviving data layer imports `@/lib/basePath` directly, which is what takes
 * the Tailwind packages out of the run's closure.
 */
export { basePath, withBasePath } from "@/lib/basePath";

/**
 * Merges class names using clsx and tailwind-merge
 *
 * Combines conditional class names and resolves Tailwind CSS conflicts.
 * This is the recommended pattern for dynamic className composition.
 *
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged and deduplicated class string
 *
 * @example
 * ```tsx
 * // Basic usage
 * cn("px-4 py-2", "bg-blue-500")
 * // => "px-4 py-2 bg-blue-500"
 *
 * // With conditionals
 * cn("base-class", isActive && "active-class", isDisabled && "opacity-50")
 *
 * // Conflicting classes resolved
 * cn("px-4", "px-8")
 * // => "px-8" (later class wins)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string for display
 *
 * Handles YYYY-MM format by using UTC to avoid timezone offset issues.
 *
 * @param dateString - Date string in any parseable format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate("2025-06")
 * // => "Jun 2025"
 * ```
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" }
): string {
  // For YYYY-MM format, append day to avoid timezone offset issues
  const normalized = /^\d{4}-\d{2}$/.test(dateString)
    ? dateString + "-15"
    : dateString;
  return new Date(normalized).toLocaleDateString("en-US", options);
}

/**
 * Truncates text to a maximum length with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum character length
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * ```ts
 * truncateText("Long description here", 10)
 * // => "Long desc..."
 * ```
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Debounces a function call
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generates a random ID for React keys
 *
 * @param prefix - Optional prefix for the ID
 * @returns Random ID string
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
