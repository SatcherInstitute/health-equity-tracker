import Card from '@mui/material/Card'
import { CITATION_APA } from '../methodologyComponents/MethodologyPage'
import { Helmet } from 'react-helmet-async'

export default function RecommendedCitationLink() {
  return (
    <>
      <Helmet>
        <title>Recommended Citation - Health Equity Tracker</title>
      </Helmet>
      <article id='recommended-citation'>
        <p>
          The Health Equity Tracker is a testament to Morehouse School of
          Medicine's commitment to promoting data democratization, health
          equity, and justice.
        </p>
        <h2 className='sr-only'>Recommended Citation</h2>
        <h3 className='mt-12 text-title font-medium'>
          APA (American Psychological Association) Format
        </h3>
        <div className='text-left font-sansText text-small text-altBlack'>
          <Card elevation={3}>
            <p className='mx-0 my-4 pl-12 pr-4 first-of-type:-indent-8'>
              {CITATION_APA}
            </p>
          </Card>
        </div>
      </article>
    </>
  )
}
