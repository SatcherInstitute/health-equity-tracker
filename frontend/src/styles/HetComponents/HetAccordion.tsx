import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import type React from 'react'
import { useId, useState } from 'react'

interface AccordionData {
  question: string
  answer: React.ReactNode
}

interface HetAccordionProps {
  accordionData: AccordionData[] | AccordionData
  divClassName?: string
  accordionClassName?: string
  summaryClassName?: string
  detailsClassName?: string
  headingLevelOverride?: 'h2' | 'h4' | 'h5' | 'h6'
}

const HetAccordion: React.FC<HetAccordionProps> = ({
  accordionData,
  divClassName,
  accordionClassName,
  summaryClassName,
  detailsClassName,
  headingLevelOverride,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const uid = useId()

  const handleChange =
    (index: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedIndex(isExpanded ? index : null)
    }

  const renderAccordionItem = (data: AccordionData, index: number) => (
    <Accordion
      slotProps={
        headingLevelOverride && { heading: { component: headingLevelOverride } }
      }
      key={index}
      expanded={expandedIndex === index}
      onChange={handleChange(index)}
      sx={{ '&::before': { content: 'none' } }}
      className={`border-methodology-green list-none rounded-md border border-solid shadow-none ${
        accordionClassName ?? 'mb-8'
      }`}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${uid}-panel-content-${index}`}
        id={`${uid}-panel-header-${index}`}
        className={`${
          expandedIndex === index
            ? 'bg-hover-alt-green rounded-t-md'
            : 'hover:bg-white-smoke'
        }`}
      >
        <div
          className={`my-0 ${
            summaryClassName ??
            'text-alt-black md:text-title md:leading-some-space p-2 text-left leading-normal font-medium md:py-4'
          }`}
        >
          {data.question}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div
          className={`text-alt-black text-text leading-some-more-space text-left font-normal ${
            detailsClassName ?? 'm-0 p-2 md:my-0 md:px-6 md:py-4'
          }`}
        >
          {data.answer}
        </div>
      </AccordionDetails>
    </Accordion>
  )

  return (
    <article className='mx-4 grid'>
      <div className={`${divClassName ?? 'py-4'}`}>
        {Array.isArray(accordionData)
          ? accordionData.map((data, index) => renderAccordionItem(data, index))
          : renderAccordionItem(accordionData, 0)}
      </div>
    </article>
  )
}

export default HetAccordion
