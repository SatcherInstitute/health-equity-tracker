import { useEffect, useRef, useState } from 'react'

interface HetTermUnderlineProps {
  children?: string
  className?: string
}

export default function HetTermUnderline(props: HetTermUnderlineProps) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [marginClass, setMarginClass] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
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

  useEffect(() => {
    const parentText = spanRef.current?.parentElement?.innerText
    if (parentText && spanRef.current) {
      const spanText = spanRef.current.innerText
      const beforeText = parentText.split(spanText)[0].slice(-1) 
      const afterText = parentText.split(spanText)[1]?.[0]

      let margin = ''
      const punctuationRegex = /[.,!?—;'"]/ 

      if (beforeText && !punctuationRegex.test(beforeText)) {
        margin += ' ml-1' 
      }
      if (afterText && !punctuationRegex.test(afterText)) {
        margin += ' mr-1' 
      }

      setMarginClass(margin)
    }
  }, [props.children])

  return (
    <span
      ref={spanRef}
      className={`font-semibold text-altGreen ${props.className} ${marginClass}`}
      style={{
        animation: isVisible
          ? 'underlineSlideIn 1s ease-out forwards'
          : 'none',
        backgroundImage: 'linear-gradient(#B5C7C2, rgba(11, 82, 64, 0.08))',
        backgroundPosition: '1% 100%',
        backgroundSize: '0% 8px',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {props.children}
    </span>
  )
}