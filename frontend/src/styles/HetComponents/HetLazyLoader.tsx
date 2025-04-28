import type { ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'

interface HetLazyLoaderProps {
  children: ReactNode
  offset?: number
  once?: boolean
  height?: number | string
  className?: string
}

export default function HetLazyLoader({
  children,
  offset = 300,
  once = true,
  height,
  className = '',
}: HetLazyLoaderProps) {
  const { ref, inView } = useInView({
    triggerOnce: once,
    rootMargin: `${offset}px`,
  })

  return (
    <div
      ref={ref}
      className={className}
      style={height ? { height } : undefined}
    >
      {inView ? children : null}
    </div>
  )
}
