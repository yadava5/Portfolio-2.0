/**
 * @fileoverview Central export for all custom hooks
 *
 * Re-exports all hooks from this directory for convenient importing.
 */

export {
  useScrollAnimation,
  type ScrollAnimationConfig,
} from "./useScrollAnimation";
export { useGSAPCleanup } from "./useGSAPCleanup";
export { usePrefersReducedMotion } from "./usePrefersReducedMotion";
export { useThemeConfig, type ThemeConfig } from "./useThemeConfig";
