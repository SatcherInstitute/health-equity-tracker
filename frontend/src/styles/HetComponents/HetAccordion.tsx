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
      className={`list-none rounded-md border border-solid border-methodologyGreen ${
        accordionClassName ?? 'mb-8'
      }`}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-content-${index}`}
        id={`panel-header-${index}`}
        className={`${
          expandedIndex === index
            ? 'bg-hoverAltGreen rounded-t-md'
            : 'hover:bg-whiteSmoke80'
        }`}
      >
        <div
          className={`my-0 ${
            summaryClassName ??
            'md:py-4 p-2 md:text-title font-medium text-altBlack md:leading-lhSomeSpace leading-lhNormal text-left'
          }`}
        >
          {data.question}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div
          className={`text-left text-text font-normal text-altBlack leading-lhSomeMoreSpace ${
            detailsClassName ?? 'md:my-0 md:px-6 md:py-4 p-2 m-0'
          }`}
        >
          {data.answer}
        </div>
      </AccordionDetails>
    </Accordion>
  )

  return (
    <article className='grid mx-4'>
      <div className={`${divClassName ?? 'py-4'}`}>
        {Array.isArray(accordionData)
          ? accordionData.map((data, index) => renderAccordionItem(data, index))
          : renderAccordionItem(accordionData, 0)}
      </div>
    </article>
  )
}

export default HetAccordion
