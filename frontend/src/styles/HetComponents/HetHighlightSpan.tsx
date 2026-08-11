import { useEffect, useRef, useState } from 'react'

interface HetHighlightSpanProps {
  children?: React.ReactNode
  className?: string
}

// The animated green underline that draws itself once the phrase scrolls into
// view. Callers own the spacing around it, so write the word space in the prose
// (`text{' '}<HetHighlightSpan>…`) exactly as you would for any other inline tag.
export default function HetHighlightSpan({
  children,
  className,
}: HetHighlightSpanProps) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = spanRef.current
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
      ref={spanRef}
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
