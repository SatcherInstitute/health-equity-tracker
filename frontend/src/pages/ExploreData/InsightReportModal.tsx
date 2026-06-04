import { Dialog } from '@mui/material'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useParamState } from '../../utils/hooks/useParamState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'
import InsightReportCard from '../ExploreData/InsightReportCard'

export default function InsightReportModal() {
  const [insightIsOpen, setInsightIsOpen] = useParamState(
    REPORT_INSIGHT_PARAM_KEY,
  )
  const fullScreen = !useIsBreakpointAndUp('sm')

  return (
    <Dialog
      open={Boolean(insightIsOpen)}
      onClose={() => setInsightIsOpen(false)}
      maxWidth='sm'
      fullWidth
      fullScreen={fullScreen}
      scroll='body'
      aria-label='AI Report Summary'
    >
      <InsightReportCard />
    </Dialog>
  )
}
