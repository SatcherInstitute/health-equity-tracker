import { useState, useRef, useEffect, type RefObject } from 'react'

export function useResponsiveWidth(
  defaultWidth: number
): [RefObject<HTMLDivElement>, number] {
  const [width, setWidth] = useState<number>(defaultWidth)
  const ref = useRef<HTMLDivElement>(document.createElement('div'))

  const forceUpdate = () => { setWidth((prevWidth) => prevWidth + 1); }

  useEffect(() => {
    const element = ref.current

    const handleResize = () => {
      if (element) {
        const newWidth = element.offsetWidth || defaultWidth
        if (newWidth !== width) {
          setWidth(newWidth)
        }
      }
    }
    // Initial width calculation
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [defaultWidth, width, forceUpdate])

  return [ref, width]
}
