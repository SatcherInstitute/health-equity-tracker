export function resolveCssVar(variable: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback
  if (!variable.startsWith('var(') && !variable.startsWith('--'))
    return variable
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
