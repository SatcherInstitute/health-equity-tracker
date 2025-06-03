import type React from 'react'
import HetAccordion from '../../styles/HetComponents/HetAccordion'
import type { Faq } from './FaqsPageData'

interface FaqGroupProps {
  title: string
  faqs: Faq[]
}

const FaqGroup: React.FC<FaqGroupProps> = ({ title, faqs }) => (
  <div className='flex flex-col md:grid md:grid-cols-6'>
    <h2 className='border border-methodology-green border-t-0 border-r-0 border-b-2 border-l-0 border-solid py-4 font-medium text-alt-green text-title md:col-span-1 md:mt-4 md:border-r-2 md:border-b-0 md:pr-4 md:text-right'>
      {title}
    </h2>
    <div className='flex w-full flex-col md:col-span-5'>
      {faqs.map((faq, index) => (
        <div key={faq.question} id={`faq-${index}`}>
          <HetAccordion accordionData={faq} accordionClassName='my-2' />
        </div>
      ))}
    </div>
  </div>
)

export default FaqGroup
