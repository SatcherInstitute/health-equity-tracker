import HetAccordion from '../../../styles/HetComponents/HetAccordion'
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
import { FULL_FAQS_LINK } from '../../../utils/internalRoutes'
import { faqMappings } from '../../FAQs/FaqsPageData'

export default function FaqSection() {
  return (
    <article className='grid'>
      <h2 className='m-0 pb-5 text-center font-bold font-sans-title text-alt-green text-header leading-lh-modal-heading'>
        Frequently asked questions
      </h2>

      <HetAccordion accordionData={faqMappings} />
      <HetTextArrowLink
        link={FULL_FAQS_LINK}
        linkText='See our full FAQ page'
        containerClassName='flex items-center justify-center mt-4 mx-auto '
        linkClassName='font-sans-title text-smallest-header'
      />
    </article>
  )
}
