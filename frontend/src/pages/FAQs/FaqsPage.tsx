import { Helmet } from 'react-helmet-async'
import {
  dataFaqGroup,
  definitionsFaqGroup,
  methodsFaqGroup,
} from './FaqsPageData'
import { communitySafetyFaqs } from '../Policy/policyContent/CommunitySafetyFaqsContent'
import FaqGroup from './FaqGroup'

export default function FaqsPage() {
  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - Health Equity Tracker</title>
      </Helmet>

      <section
        id='main-content'
        aria-labelledby='main-content'
        tabIndex={-1}
        className='flex flex-col w-svw justify-center max-w-lgXl py-16 px-8 mx-auto'
      >
        <h1
          id='main'
          tabIndex={-1}
          className='font-sansTitle text-bigHeader font-bold leading-lhNormal text-altGreen'
        >
          Frequently Asked Questions
        </h1>
        <h2 className='sr-only'> Frequently Asked Questions</h2>
        <FaqGroup title='Methods' faqs={methodsFaqGroup} />
        <FaqGroup title='Data Collection' faqs={dataFaqGroup} />
        <FaqGroup title='Definitions' faqs={definitionsFaqGroup} />
      </section>
    </>
  )
}
