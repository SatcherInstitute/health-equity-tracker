import { type Ref, useEffect, useRef, useState } from 'react'

interface HetHighlightSpanProps {
  children?: React.ReactNode
  className?: string
  ref?: Ref<HTMLSpanElement>
}

// The animated green underline that draws itself once the phrase scrolls into
// view. Callers own spacing and any surrounding text.
export default function HetHighlightSpan({
  children,
  className,
  ref,
}: HetHighlightSpanProps) {
  const localRef = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = localRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <span
      ref={(node) => {
        localRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={`font-semibold text-dark-green ${className ?? ''}`}
      style={{
        animation: isVisible ? 'underlineSlideIn 1s ease-out forwards' : 'none',
        backgroundImage: 'linear-gradient(#B8CCC6, rgba(220, 229, 226, 0.2))',
        backgroundPosition: '1% 100%',
        backgroundSize: '0% 8px',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {children}
    </span>
  )
}
