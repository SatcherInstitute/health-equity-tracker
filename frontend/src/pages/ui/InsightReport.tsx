import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import InsightReportModal from '../ExploreData/InsightReportModal'
import InsightReportModalButton from './InsightReportModalButton'

export default function InsightReport() {
  if (!SHOW_INSIGHT_GENERATION) return null

  return (
    <>
      <InsightReportModal
      />
      <div className='rounded-sm bg-white shadow-raised md:m-card-gutter md:flex md:w-90p md:flex-col md:justify-center md:p-2'>
        <InsightReportModalButton />
      </div>
    </>
  )
}


