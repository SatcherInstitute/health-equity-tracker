import { useCallback } from 'react'

export function useScrollToAnchor() {
  const scrollToAnchor = useCallback((id: string, offset: number = -70) => {
    const element = document.getElementById(id)

    if (element) {
      const yOffset = offset
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset

      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [])

  return scrollToAnchor
}
