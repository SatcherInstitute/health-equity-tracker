import { useEffect, useRef, useState } from 'react'

interface HetTermUnderlineProps {
  children?: string
  className?: string
  tabIndex?: number
}

export default function HetTermUnderline({
  children,
  className,
  tabIndex = 0,
}: HetTermUnderlineProps) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (spanRef.current) {
      observer.observe(spanRef.current)
    }

    return () => {
      if (spanRef.current) {
        observer.unobserve(spanRef.current)
      }
    }
  }, [])

  return (
    <span
      ref={spanRef}
      className={`font-semibold text-altGreen ${className}`}
      style={{
        animation: isVisible ? 'underlineSlideIn 1s ease-out forwards' : 'none',
        backgroundImage: 'linear-gradient(#B8CCC6, rgba(220, 229, 226, 0.2))',
        backgroundPosition: '1% 100%',
        backgroundSize: '0% 8px',
        backgroundRepeat: 'no-repeat',
      }}
      tabIndex={tabIndex}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
        }
      }}
    >
      {children}
    </span>
  )
}
