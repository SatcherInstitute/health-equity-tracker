// biome-ignore assist/source/organizeImports: <broken>
import type { Config } from 'tailwindcss'
import {
  ThemeBorderRadii,
  ThemeBoxShadows,
  ThemeFontSizes,
  ThemeFonts,
  ThemeLineHeights,
  ThemeStandardScreenSizes,
  ThemeZIndexValues,
  het,
} from './src/styles/DesignTokens'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  important: true,
  theme: {
    screens: ThemeStandardScreenSizes,
    maxHeight: ThemeStandardScreenSizes,
    maxWidth: ThemeStandardScreenSizes,
    borderRadius: ThemeBorderRadii,
    boxShadow: ThemeBoxShadows,
    colors: het,
    fontSize: ThemeFontSizes,
    fontFamily: ThemeFonts,
    lineHeight: ThemeLineHeights,

    // TODO: improve this hack that convinces TS that Tailwind can use z index numbers (not only strings)
    zIndex: ThemeZIndexValues as Record<string, unknown> as Record<
      string,
      string
    >,
  },
  plugins: [],
} satisfies Config
