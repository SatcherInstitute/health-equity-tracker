import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import { colors } from '../tokens/colors'

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
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const node = spanRef.current
    if (!node || prefersReducedMotion) return

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
  }, [prefersReducedMotion])

  return (
    <span
      ref={spanRef}
      data-testid='insight-highlight'
      className={`font-semibold text-dark-green ${className ?? ''}`}
      style={{
        animation:
          isVisible && !prefersReducedMotion
            ? 'underlineSlideIn 1s ease-out forwards'
            : 'none',
        backgroundImage: `linear-gradient(${colors.methodologyGreen}, ${colors.tinyTagGray})`,
        backgroundPosition: '1% 100%',
        backgroundSize: prefersReducedMotion ? '100% 8px' : '0% 8px',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {children}
    </span>
  )
}
