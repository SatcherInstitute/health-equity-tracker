export function getCssVar<T>(cssVarName: string): T {
  if (!cssVarName.startsWith('--')) {
    cssVarName = '--' + cssVarName
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(
    cssVarName
  )

  if (!value) console.log(`CSS Custom Property Not Found: ${cssVarName}`)

  return value as T
}
