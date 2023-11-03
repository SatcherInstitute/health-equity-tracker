export function getCssVar(cssVarName: string): string {
  if (!cssVarName.startsWith('--')) {
    cssVarName = '--' + cssVarName
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(
    cssVarName
  )

  if (!value) console.log(`CSS Custom Property Not Found: ${cssVarName}`)

  return value
}
