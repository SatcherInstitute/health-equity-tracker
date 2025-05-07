import type { ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'

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
  const { ref, inView, entry } = useInView({
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
