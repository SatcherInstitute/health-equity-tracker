import { Helmet } from 'react-helmet-async'
import HetAccordion from '../../../styles/HetComponents/HetAccordion'
import { communitySafetyFaqs } from '../policyContent/CommunitySafetyFaqsContent'

export default function CommunitySafetyFaqsTab() {
  return (
    <>
      <Helmet>
        <title>FAQs - Health Equity Tracker</title>
      </Helmet>
      <HetAccordion
        accordionData={communitySafetyFaqs}
        headingLevelOverride='h2'
      />
    </>
  )
}
