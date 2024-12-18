import HetAccordion from '../../../styles/HetComponents/HetAccordion'
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
import { FULL_FAQS_LINK } from '../../../utils/internalRoutes'
import { faqMappings } from '../../FAQs/FaqsPageData'

export default function FaqSection() {
  return (
    <article className='grid'>
      <h3 className='m-0 pb-5 text-center font-bold font-sansTitle text-altGreen text-header leading-lhModalHeading'>
        Frequently asked questions
      </h3>

      <HetAccordion accordionData={faqMappings} />
      <HetTextArrowLink
        link={FULL_FAQS_LINK}
        linkText='See our full FAQ page'
        containerClassName='flex items-center justify-center mt-4 mx-auto '
        linkClassName='font-sansTitle text-smallestHeader'
      />
    </article>
  )
}
