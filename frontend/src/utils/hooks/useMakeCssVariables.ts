import { useEffect } from 'react'
import { ThemeFontSizes, ThemeFonts, het } from '../../styles/DesignTokens'

export const useMakeCssVariables = () => {
  useEffect(() => {
    Object.entries(het).forEach(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      document.documentElement.style.setProperty(`--color-${kebabKey}`, value)
    })
    Object.entries(ThemeFontSizes).forEach(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      document.documentElement.style.setProperty(`--text-${kebabKey}`, value)
    })
    Object.entries(ThemeFonts).forEach(([key, valueList]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      document.documentElement.style.setProperty(
        `--font-${kebabKey}`,
        valueList.join(', '),
      )
    })
  }, [])
}
