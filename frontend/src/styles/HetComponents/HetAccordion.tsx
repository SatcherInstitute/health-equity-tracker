import type React from 'react'
import { useState } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

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
}

const HetAccordion: React.FC<HetAccordionProps> = ({
  accordionData,
  divClassName,
  accordionClassName,
  summaryClassName,
  detailsClassName,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const handleChange =
    (index: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedIndex(isExpanded ? index : null)
    }

  const renderAccordionItem = (data: AccordionData, index: number) => (
    <Accordion
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
      className={`list-none rounded-md border border-methodologyGreen border-solid ${
        accordionClassName ?? 'mb-8'
      }`}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-content-${index}`}
        id={`panel-header-${index}`}
        className={`${
          expandedIndex === index
            ? 'rounded-t-md bg-hoverAltGreen'
            : 'hover:bg-whiteSmoke80'
        }`}
      >
        <div
          className={`my-0 ${
            summaryClassName ??
            'p-2 text-left font-medium text-altBlack leading-lhNormal md:py-4 md:text-title md:leading-lhSomeSpace'
          }`}
        >
          {data.question}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div
          className={`text-left font-normal text-altBlack text-text leading-lhSomeMoreSpace ${
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
