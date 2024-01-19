import Card from '@mui/material/Card'
import { CITATION_APA } from '../methodologyComponents/MethodologyPage'
import { Helmet } from 'react-helmet-async'

export default function RecommendedCitationLink() {
  return (
    <section id='#recommended-citation'>
      <article>
        <Helmet>
          <title>Recommended Citation - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Recommended Citation</h2>
        <h3 className='font-sansTitle text-title'>
          APA (American Psychological Association) Format
        </h3>
        <div className='w-full text-left font-sansText text-small text-altBlack'>
          <Card elevation={3}>
            <p className='mx-0 my-4 pl-12 pr-4 first-of-type:-indent-8'>
              {CITATION_APA}
            </p>
          </Card>
        </div>
      </article>
    </section>
  )
}
