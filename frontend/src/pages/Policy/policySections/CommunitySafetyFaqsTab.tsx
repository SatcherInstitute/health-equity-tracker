import HetAccordion from '../../../styles/HetComponents/HetAccordion'
import { communitySafetyFaqs } from '../policyContent/CommunitySafetyFaqsContent'

export default function CommunitySafetyFaqsTab() {
  return (
    <>
      <title>FAQs - Health Equity Tracker</title>

      <HetAccordion
        accordionData={communitySafetyFaqs}
        headingLevelOverride='h2'
      />
    </>
  )
}
