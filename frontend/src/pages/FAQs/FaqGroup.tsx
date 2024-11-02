import type React from 'react'
import HetAccordion from '../../styles/HetComponents/HetAccordion'
import type { Faq } from './FaqsPageData'

interface FaqGroupProps {
  title: string
  faqs: Faq[]
}

const FaqGroup: React.FC<FaqGroupProps> = ({ title, faqs }) => (
  <div className='md:grid md:grid-cols-6 flex flex-col'>
    <h3 className='md:col-span-1 text-title font-medium text-altGreen md:text-right md:mt-4 md:pr-4 border border-solid border-r-0 md:border-r-2 border-l-0 border-t-0 border-b-2 md:border-b-0 border-methodologyGreen py-4'>
      {title}
    </h3>
    <div className='md:col-span-5 flex flex-col w-full'>
      {faqs.map((faq, index) => (
        <div key={index} id={`faq-${index}`}>
          <HetAccordion accordionData={faq} accordionClassName='my-2' />
        </div>
      ))}
    </div>
  </div>
)

export default FaqGroup
