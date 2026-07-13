import { type ReactNode, useEffect, useRef, useState } from 'react'

function useInView({
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
        if (entry.isIntersecting) {
          setInView(true)
          if (triggerOnce) observer.disconnect()
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, threshold, triggerOnce])

  return { ref, inView }
}

interface HetLazyLoaderProps {
  children: ReactNode
  offset?: number
  once?: boolean
  height?: number | string
  className?: string
  placeholder?: ReactNode
  debug?: boolean
}

export default function HetLazyLoader({
  children,
  offset = 300,
  once = true,
  height,
  className = '',
  placeholder = null,
}: HetLazyLoaderProps) {
  const { ref, inView } = useInView({
    triggerOnce: once,
    rootMargin: `${offset}px ${offset}px ${offset}px ${offset}px`,
    threshold: 0,
  })

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {inView ? children : placeholder}
    </div>
  )
}
