import { Helmet } from 'react-helmet-async'
import {
  dataFaqGroup,
  definitionsFaqGroup,
  methodsFaqGroup,
} from './FaqsPageData'
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
        className='mx-auto flex w-svw max-w-lgXl flex-col justify-center px-8 py-16'
      >
        <h1
          id='main'
          tabIndex={-1}
          className='font-bold font-sansTitle text-altGreen text-bigHeader leading-lhNormal'
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
