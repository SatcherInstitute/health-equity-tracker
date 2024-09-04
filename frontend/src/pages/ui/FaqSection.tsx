import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { FAQ_TAB_LINK } from '../../utils/internalRoutes'
import { type FAQ, selectFAQs } from '../WhatIsHealthEquity/FaqData'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'

export default function FaqSection() {
  return (
    <article className='grid'>
      <div className='pb-5 text-left font-serif text-bigHeader font-light text-altGreen'>
        <h3 className='m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen text-center'>
          Frequently asked questions
        </h3>
      </div>

      <div className='px-0 py-5'>
        {selectFAQs.map((faq, index) => {
          return (
            <FAQListItem
              key={faq.questionText}
              ariaControls={`panel${index + 1}-content`}
              id={`panel${index + 1}-header`}
              faq={faq}
            />
          )
        })}
      </div>
      <div className='text-left'>
        <HetLinkButton
          href={FAQ_TAB_LINK}
          className='text-smallestHeader text-altGreen underline'
        >
          See our full FAQ page
        </HetLinkButton>
      </div>
    </article>
  )
}

interface FAQListItemProps {
  key: string
  ariaControls: string
  id: string
  faq: FAQ
}

function FAQListItem(props: FAQListItemProps) {
  return (
    <Accordion className='m-0 list-none font-light'>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={props.ariaControls}
        id={props.id}
      >
        <div className='text-left font-serif text-title leading-lhSuperLoose text-altBlack sm:text-smallHeader'>
          {props.faq.questionText}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className='text-left text-small font-normal text-altBlack'>
          {props.faq.answer}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
