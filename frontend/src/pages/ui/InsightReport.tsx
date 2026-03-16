import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import type { MadLibId } from '../../utils/MadLibs'
import InsightReportModalButton from './InsightReportModalButton'

interface InsightReportProps {
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
}

export default function InsightReport(props: InsightReportProps) {
  if (!SHOW_INSIGHT_GENERATION) return null

  return (
    <div className='rounded-sm bg-white shadow-raised md:m-card-gutter md:flex md:w-90p md:flex-col md:justify-center md:p-2'>
      <InsightReportModalButton
        onInsightClick={() => props.setTrackerMode('comparegeos')}
      />
    </div>
  )
}
