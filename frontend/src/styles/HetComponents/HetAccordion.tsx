import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import type React from 'react'
import { useState } from 'react'

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
      sx={{
        border: 'none',
        boxShadow: 'none',
        '&::before': {
          content: 'none',
        },
      }}
      className={`list-none rounded-md border border-methodology-green border-solid ${
        accordionClassName ?? 'mb-8'
      }`}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-content-${index}`}
        id={`panel-header-${index}`}
        className={`${
          expandedIndex === index
            ? 'rounded-t-md bg-hover-alt-green'
            : 'hover:bg-white-smoke80'
        }`}
      >
        <div
          className={`my-0 ${
            summaryClassName ??
            'p-2 text-left font-medium text-alt-black leading-normal md:py-4 md:text-title md:leading-some-space'
          }`}
        >
          {data.question}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div
          className={`text-left font-normal text-alt-black text-text leading-some-more-space ${
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
