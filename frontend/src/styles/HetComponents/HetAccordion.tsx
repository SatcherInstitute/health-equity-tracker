import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type React from 'react'
import { useState } from 'react'

interface AccordionData {
  question: React.ReactNode
  answer: React.ReactNode
}

interface HetAccordionProps {
  accordionData: AccordionData[] | AccordionData
  divClassName?: string
  accordionClassName?: string
  summaryClassName?: string
  detailsClassName?: string
}

const HetAccordion: React.FC<HetAccordionProps> = ({
  accordionData,
  divClassName,
  accordionClassName,
  summaryClassName,
  detailsClassName,
}) => {
  const items = Array.isArray(accordionData) ? accordionData : [accordionData]
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <article className='mx-4 grid'>
      <div className={divClassName ?? 'py-4'}>
        {items.map((data, index) => {
          const isExpanded = expandedIndex === index
          const detailsId = `het-accordion-panel-${index}`

          return (
            <div
              key={index}
              className={`list-none rounded-md border border-methodology-green border-solid ${
                accordionClassName ?? 'mb-8'
              }`}
            >
              {/* Summary row: content on left, expand button on right */}
              <div
                className={`flex items-start gap-2 ${
                  isExpanded
                    ? 'rounded-t-md bg-hover-alt-green'
                    : 'hover:bg-white-smoke'
                }`}
              >
                <div
                  className={`flex-1 ${
                    summaryClassName ??
                    'p-4 text-left font-medium text-alt-black leading-normal md:py-4 md:text-title md:leading-some-space'
                  }`}
                >
                  {data.question}
                </div>
                <button
                  type='button'
                  aria-expanded={isExpanded}
                  aria-controls={detailsId}
                  aria-label={
                    isExpanded ? 'Collapse section' : 'Expand section'
                  }
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className='m-3 shrink-0 cursor-pointer rounded-sm border-none bg-transparent p-0.5 text-alt-black transition-transform duration-200'
                  style={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <ExpandMoreIcon aria-hidden='true' />
                </button>
              </div>

              {/* Details panel */}
              {isExpanded && (
                <div
                  id={detailsId}
                  className={`animate-expand-down text-left font-normal text-alt-black text-text leading-some-more-space ${
                    detailsClassName ?? 'm-0 p-4 md:my-0 md:px-6 md:py-4'
                  }`}
                >
                  {data.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}

export default HetAccordion
