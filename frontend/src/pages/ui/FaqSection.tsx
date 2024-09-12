import { WHAT_IS_HEALTH_EQUITY_FAQ_TAB_LINK } from '../../utils/internalRoutes'
import { selectFAQs } from '../WhatIsHealthEquity/FaqData'
import HetAccordion from '../../styles/HetComponents/HetAccordion'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'

export default function FaqSection() {
  return (
    <article className='grid'>
      <div className='pb-5 text-left font-serif text-bigHeader font-light text-altGreen'>
        <h3 className='m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen text-center'>
          Frequently asked questions
        </h3>
      </div>
      <HetAccordion accordionData={selectFAQs} />
      <HetTextArrowLink
        link={WHAT_IS_HEALTH_EQUITY_FAQ_TAB_LINK}
        linkText='See our full FAQ page'
        containerClassName='flex items-center justify-center mt-4 mx-auto '
        linkClassName='font-sansTitle text-smallestHeader'
      />
    </article>
  )
}
