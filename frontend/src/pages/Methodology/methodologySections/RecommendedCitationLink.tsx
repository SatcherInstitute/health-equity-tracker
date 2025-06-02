import Card from '@mui/material/Card'
import { CITATION_APA } from '../../../cards/ui/SourcesHelpers'

export default function RecommendedCitationLink() {
  return (
    <>
      <title>Recommended Citation - Health Equity Tracker</title>
      <article id='recommended-citation'>
        <p>
          The Health Equity Tracker is a testament to Morehouse School of
          Medicine's commitment to promoting data democratization, health
          equity, and justice.
        </p>
        <p className='mt-12 font-medium text-title'>
          APA (American Psychological Association) Format
        </p>
        <div className='text-left font-sans-text text-alt-black text-small'>
          <Card elevation={3}>
            <p className='first-of-type:-indent-8 mx-0 my-4 pr-4 pl-12'>
              {CITATION_APA}
            </p>
          </Card>
        </div>
      </article>
    </>
  )
}
