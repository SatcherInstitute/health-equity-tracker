import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import { policyFaqs } from '../policyContent/FaqsContent'
<<<<<<< HEAD
import HetAccordion from '../../../styles/HetComponents/HetAccordion'

export default function FaqsTab() {
	
=======
import { useState } from 'react'

export default function FaqsTab() {
	const [expanded, setExpanded] = useState<string | false>(false)

	const handleChange =
		(panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false)
		}

>>>>>>> f760344d (faqs tab)
	return (
		<>
			<Helmet>
				<title>FAQs - Health Equity Tracker</title>
			</Helmet>
			<h2 className='sr-only'>FAQs</h2>
<<<<<<< HEAD
			<HetAccordion accordionData={policyFaqs}/>
=======
			<article className='grid'>
				<div className='p-4'>
					{policyFaqs.map((faq, index) => (
						<Accordion
							key={faq.question}
							expanded={expanded === `panel${index}`}
							onChange={handleChange(`panel${index}`)}
							sx={{
								border: 'none',
								boxShadow: 'none',
								'&::before': {
									content: 'none',
								},
							}}
							className='list-none rounded-md border border-solid border-methodologyGreen mb-8 '
						>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls={`panel${index + 1}-content`}
								id={`panel${index + 1}-header`}
								className={`${
									expanded === `panel${index}`
										? 'bg-hoverAltGreen rounded-t-md'
										: 'hover:bg-whiteSmoke80'
								}`}
							>
								<div className='my-0 py-4 text-title font-medium text-altBlack'>
									{faq.question}
								</div>
							</AccordionSummary>
							<AccordionDetails>
<<<<<<< HEAD
								<div className='text-left text-text font-normal text-altBlack'>
=======
								<div className='my-0 px-6 py-4 text-left text-text font-normal text-altBlack'>
>>>>>>> acf07369 (font update, content addition for current efforts, reform opps, and FAQs tabs, and accordion redesign (#3571))
									{faq.answer}
								</div>
							</AccordionDetails>
						</Accordion>
					))}
				</div>
			</article>
>>>>>>> f760344d (faqs tab)
		</>
	)
}