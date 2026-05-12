/**
 * Resolves a CSS custom property (variable) into its computed browser value.
 *
 * IMPORTANT:
 * Most application code should NOT need this helper.
 *
 * Prefer importing static color tokens directly from `colorValues.ts`
 * for TypeScript logic, D3 scales, interpolators, calculations, and
 * non-DOM rendering:
 *
 *   import { hetColors } from './colorValues'
 *
 * This utility exists only for cases where the browser-computed value
 * is specifically required at runtime, such as:
 *
 * - Reading CSS variables from the DOM
 * - Dynamic theme switching
 * - Runtime-computed styles
 * - Canvas rendering
 * - Interop with APIs that require fully resolved color strings
 *
 * If a value is already a hex/rgb/etc string, it is returned unchanged.
 */

export function resolveCssVar(variable: string, fallback = ''): string {
  if (typeof window === 'undefined') {
    return fallback
  }

  // Already a resolved color value
  if (!variable.startsWith('var(') && !variable.startsWith('--')) {
    return variable
  }

  try {
    const name = variable.startsWith('var(')
      ? variable.replace(/^var\(\s*(--[^,)]*?)\s*(?:,.*?)?\)$/, '$1')
      : variable

    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() || fallback
    )
  } catch (error) {
    console.error('Error resolving CSS variable:', error)

    return fallback
  }
}
