import { useEffect, useRef, useState } from 'react'

export function useInView({
  triggerOnce,
  rootMargin,
  threshold,
}: {
  triggerOnce: boolean
  rootMargin: string
  threshold: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && triggerOnce) observer.disconnect()
      },
      { rootMargin, threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, threshold, triggerOnce])

  return { ref, inView }
}
