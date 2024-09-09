import { Helmet } from 'react-helmet-async'
import { policyFaqs } from '../policyContent/FaqsContent'
import HetAccordion from '../../../styles/HetComponents/HetAccordion'

export default function FaqsTab() {
	
	return (
		<>
			<Helmet>
				<title>FAQs - Health Equity Tracker</title>
			</Helmet>
			<h2 className='sr-only'>FAQs</h2>
			<HetAccordion accordionData={policyFaqs}/>
		</>
	)
}