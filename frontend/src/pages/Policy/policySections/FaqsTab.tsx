import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import { policyFaqs } from '../policyContent/FaqsContent'
import { useState } from 'react'

export default function FaqsTab() {
	const [expanded, setExpanded] = useState<string | false>(false)

	const handleChange =
		(panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false)
		}

	return (
		<>
			<Helmet>
				<title>FAQs - Health Equity Tracker</title>
			</Helmet>
			<h2 className='sr-only'>FAQs</h2>
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
								<div className='my-0 px-6 py-4 text-left text-text font-normal text-altBlack'>
=======
								<div className='text-left text-text font-normal text-altBlack'>
>>>>>>> f760344d (faqs tab)
									{faq.answer}
								</div>
							</AccordionDetails>
						</Accordion>
					))}
				</div>
			</article>
		</>
	)
}