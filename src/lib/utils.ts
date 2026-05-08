/**
 * @fileoverview Utility functions for the portfolio application
 *
 * This module provides common utility functions used throughout the app,
 * including className merging for Tailwind CSS.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const configuredBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.NODE_ENV === "production" ? "/Portfolio-2.0" : "");

export const basePath = configuredBasePath.replace(/\/$/, "");

export function withBasePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${basePath}${path}`;
}

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
