import type { InsightSection } from '../../utils/insightPayload'
import HetHighlightSpan from './HetHighlightSpan'

interface HetHighlightedTextProps {
  section: InsightSection
  className?: string
}

// Renders a sentence with its one key phrase underlined. The phrase is a
// verbatim substring by the time it reaches here (see parseInsightSections), so
// splitting on it preserves the surrounding spacing exactly as written.
export default function HetHighlightedText({
  section,
  className,
}: HetHighlightedTextProps) {
  const { text, highlight } = section
  if (!highlight) return <>{text}</>

  const start = text.indexOf(highlight)
  if (start === -1) return <>{text}</>

  return (
    <>
      {text.slice(0, start)}
      <HetHighlightSpan className={className}>{highlight}</HetHighlightSpan>
      {text.slice(start + highlight.length)}
    </>
  )
}
