import styles from './FaqSection.module.scss'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { FAQ_TAB_LINK } from '../../utils/internalRoutes'
import { type FAQ, selectFAQs } from '../WhatIsHealthEquity/FaqData'
import HetTextButton from '../../styles/HetComponents/HetTextButton'

interface FAQListItemProps {
  key: string
  ariaControls: string
  id: string
  faq: FAQ
}

function FAQListItem(props: FAQListItemProps) {
  return (
    <Accordion className={styles.FaqListItem}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={props.ariaControls}
        id={props.id}
      >
        <Typography className={styles.FaqQuestion} variant='h2' component='h4'>
          {props.faq.questionText}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div className={styles.FaqAnswer}>{props.faq.answer}</div>
      </AccordionDetails>
    </Accordion>
  )
}

export default function FaqSection() {
  return (
    <Grid container component='article'>
      <Grid item>
        <Typography className={styles.FaqHeader} variant='h1' component='h3'>
          Frequently asked questions
        </Typography>
      </Grid>
      <Grid item xs={12} className={styles.FaqQAItem}>
        {selectFAQs.map((faq, index) => {
          return (
            <FAQListItem
              key={faq.questionText}
              ariaControls={`panel${index + 1}-content`}
              id={`panel${index + 1}-header`}
              faq={faq}
            />
          )
        })}
      </Grid>
      <Grid item>
        <HetTextButton
          href={FAQ_TAB_LINK}
          className='text-smallestHeader text-alt-green underline'
        >
          See our full FAQ page
        </HetTextButton>
      </Grid>
    </Grid>
  )
}
