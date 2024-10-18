import { FULL_FAQS_LINK } from '../../utils/internalRoutes'
import { selectFAQs } from '../FAQs/FaqData'
import HetAccordion from '../../styles/HetComponents/HetAccordion'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'

export default function FaqSection() {
  return (
    <article className='grid'>
      <h3 className='m-0 pb-5 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen text-center'>
        Frequently asked questions
      </h3>

      <HetAccordion accordionData={selectFAQs} />
      <HetTextArrowLink
        link={FULL_FAQS_LINK}
        linkText='See our full FAQ page'
        containerClassName='flex items-center justify-center mt-4 mx-auto '
        linkClassName='font-sansTitle text-smallestHeader'
      />
    </article>
  )
}
