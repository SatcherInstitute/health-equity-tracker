import HetMobileDrawer from '../../styles/HetComponents/HetMobileDrawer'
import { useParamState } from '../../utils/hooks/useParamState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'
import InsightReportCard from '../ExploreData/InsightReportCard'

export default function InsightReportModal() {
  const [insightIsOpen, setInsightIsOpen] = useParamState(
    REPORT_INSIGHT_PARAM_KEY,
  )

  return (
    <HetMobileDrawer
      open={Boolean(insightIsOpen)}
      onClose={() => setInsightIsOpen(false)}
      ariaLabel='AI Report Summary'
    >
      <InsightReportCard />
    </HetMobileDrawer>
  )
}
