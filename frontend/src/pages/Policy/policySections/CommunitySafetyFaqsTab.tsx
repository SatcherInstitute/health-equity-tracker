import { Helmet } from 'react-helmet-async'
import { communitySafetyFaqs } from '../policyContent/CommunitySafetyFaqsContent'
import HetAccordion from '../../../styles/HetComponents/HetAccordion'

export default function CommunitySafetyFaqsTab() {
  return (
    <>
      <Helmet>
        <title>FAQs - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>FAQs</h2>
      <HetAccordion accordionData={communitySafetyFaqs} searchTerm={''} />
    </>
  )
}
