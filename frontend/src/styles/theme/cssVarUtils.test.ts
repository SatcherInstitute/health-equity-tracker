import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { hetColors } from './colorValues'
import { het } from './colorVars'
import { resolveCssVar } from './cssVarUtils'

describe('Theme Token Integrity', () => {
  // Point to the specific file containing the Tailwind @theme block
  const cssPath = path.resolve(__dirname, './colorVars.css')
  const cssContent = fs.readFileSync(cssPath, 'utf8')

  test('TS Logic: colorVars (het) should have an entry for every key in colorValues', () => {
    const sourceKeys = Object.keys(hetColors).sort()
    const varKeys = Object.keys(het).sort()

    expect(varKeys).toEqual(expect.arrayContaining(sourceKeys))
  })

  test('CSS Wiring: Every var() defined in colorVars.ts must be mapped to an MUI variable in colorVars.css', () => {
    for (const [key, varUsage] of Object.entries(het)) {
      if (typeof varUsage === 'string' && varUsage.startsWith('var(--')) {
        const varName = varUsage
          .replace(/var\(|\)/g, '')
          .split(',')[0]
          .trim()

        // Regex to capture the value assigned to the variable
        // Matches: --color-name: <captured_value>;
        const matcher = new RegExp(`${varName}\\s*:\\s*([^;]+);`)
        const match = cssContent.match(matcher)

        if (!match) {
          throw new Error(
            `❌ Token "${key}" (${varName}) is not defined in colorVars.css.`,
          )
        }

        const assignedValue = match[1].trim()

        // VALIDATION: Ensure it points to an MUI variable
        if (!assignedValue.startsWith('var(--mui-palette')) {
          throw new Error(
            `❌ Architecture Violation for "het.${key}":\n` +
              `Expected "${varName}" to be mapped to a MUI variable, but found: "${assignedValue}"\n` +
              `Check your colorVars.css file!`,
          )
        }
      }
    }
  })

  test('CSS Reverse Check: colorVars.css must not contain unmapped or hardcoded colors', () => {
    // 1. Find all lines in the CSS that look like a Tailwind color definition
    // Matches any line starting with "--color-"
    const definedLines = cssContent.match(/--color-[\w-]+:[^;]+;/g) || []

    for (const line of definedLines) {
      // 2. Ensure the line follows the architecture: "--color-name: var(--mui-palette...);"
      if (!line.includes('var(--mui-palette')) {
        throw new Error(
          `Architecture Violation: Found a hardcoded or stray color in colorVars.css:\n` +
            ` 👉 "${line.trim()}"\n` +
            `All colors must be mapped to var(--mui-palette-...).`,
        )
      }

      // 3. Ensure this color actually exists in your TypeScript 'het' object
      const varName = line.split(':')[0].trim() // e.g., "--color-alt-green"
      const existsInTs = Object.values(het).some((v) => v.includes(varName))

      if (!existsInTs) {
        throw new Error(
          `Stray Color: "${varName}" is defined in colorVars.css but is missing from colorVars.ts (het).\n` +
            `Keep all files in sync to prevent style drift!`,
        )
      }
    }
  })
})

describe('resolveCssVar()', () => {
  const mockGetPropertyValue = vi.fn()

  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: mockGetPropertyValue,
    } as unknown as CSSStyleDeclaration)
  })

  afterEach(() => vi.clearAllMocks())

  test('returns non-variable values as-is', () => {
    expect(resolveCssVar('#ff0000')).toBe('#ff0000')
  })

  test('resolves var() syntax', () => {
    mockGetPropertyValue.mockReturnValue(' #123456 ')
    expect(resolveCssVar('var(--my-color)')).toBe('#123456')
  })

  test('returns fallback when variable is not found', () => {
    mockGetPropertyValue.mockReturnValue('')
    expect(resolveCssVar('var(--missing)', 'fallback')).toBe('fallback')
  })
})
