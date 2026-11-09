import FaqGroup from './FaqGroup'
import {
  dataFaqGroup,
  definitionsFaqGroup,
  methodsFaqGroup,
} from './FaqsPageData'

export default function FaqsPage() {
  return (
    <>
      <title>Frequently Asked Questions - Health Equity Tracker</title>

      <section
        id='main-content'
        aria-labelledby='main'
        tabIndex={-1}
        className='max-w-lgplus mx-auto flex w-svw flex-col justify-center px-8 py-16'
      >
        <h1
          id='main'
          className='font-sans-title text-alt-green text-big-header my-8 leading-normal font-bold'
        >
          Frequently Asked Questions
        </h1>
        <FaqGroup title='Methods' faqs={methodsFaqGroup} />
        <FaqGroup title='Data Collection' faqs={dataFaqGroup} />
        <FaqGroup title='Definitions' faqs={definitionsFaqGroup} />
      </section>
    </>
  )
}
