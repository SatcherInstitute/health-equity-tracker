import { Dialog, useMediaQuery, useTheme } from '@mui/material'
import { useParamState } from '../../utils/hooks/useParamState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'
import InsightReportCard from '../ExploreData/InsightReportCard'

export default function InsightReportModal() {
  const [insightIsOpen, setInsightIsOpen] = useParamState(
    REPORT_INSIGHT_PARAM_KEY,
  )
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog
      open={Boolean(insightIsOpen)}
      onClose={() => setInsightIsOpen(false)}
      maxWidth='sm'
      fullWidth
      fullScreen={fullScreen}
      scroll='paper'
      aria-label='AI Report Summary'
    >
      <InsightReportCard />
    </Dialog>
  )
}
