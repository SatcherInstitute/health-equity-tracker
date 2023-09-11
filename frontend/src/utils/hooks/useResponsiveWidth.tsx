import { useState, useRef, useEffect, type RefObject } from 'react'

export function useResponsiveWidth(
  defaultWidth: number
): [RefObject<HTMLDivElement>, number] {
  const [width, setWidth] = useState<number>(defaultWidth)
  // Trigger a re-render when the width changes
  const [, setForceUpdate] = useState({})
  // Initial spec state is set in useEffect when default geo is set
  const ref = useRef<HTMLDivElement>(document.createElement('div'))

  const forceUpdate = () => { setForceUpdate({}); }

  useEffect(() => {
    const element = ref.current

    if (element && width === defaultWidth) {
      const newWidth = element.offsetWidth || defaultWidth
      setWidth(newWidth)
    }

    const handleResize = () => {
      if (element) {
        const newWidth = element.offsetWidth || defaultWidth
        setWidth(newWidth)
        forceUpdate()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [width, defaultWidth, forceUpdate])

  return [ref, width]
}
