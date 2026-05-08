export function resolveColor(color: string): string {
  if (
    typeof window === 'undefined' ||
    (!color.startsWith('var(') && !color.startsWith('--'))
  ) {
    return color
  }
  try {
    const variableName = color.startsWith('var(')
      ? color.replace(/^var\(\s*(--[^,)]*?)\s*(?:,.*?)?\)$/, '$1')
      : color
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim() || '#000000'
    )
  } catch (error) {
    console.error('Error resolving color:', error)
    return '#000000'
  }
}
