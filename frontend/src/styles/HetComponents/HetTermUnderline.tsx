import { useEffect, useRef, useState } from 'react'
import HetHighlightSpan from './HetHighlightSpan'

interface HetTermUnderlineProps {
  children?: string
  className?: string
  tabIndex?: number
}

export default function HetTermUnderline({
  children,
  className,
}: HetTermUnderlineProps) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const [marginClass, setMarginClass] = useState('')

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
  }, [children])

  return (
    <HetHighlightSpan
      ref={spanRef}
      className={`${className ?? ''} ${marginClass}`}
    >
      {children}
    </HetHighlightSpan>
  )
}
