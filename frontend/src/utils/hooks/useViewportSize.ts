import { useEffect, useState } from 'react'

export function useViewportSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return size
}
