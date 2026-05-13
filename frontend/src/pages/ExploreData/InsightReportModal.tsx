import { Dialog, DialogContent } from '@mui/material'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import { useParamState } from '../../utils/hooks/useParamState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'
import InsightReportCard from '../ExploreData/InsightReportCard'

export default function InsightReportModal() {
  const [insightIsOpen, setInsightIsOpen] = useParamState(
    REPORT_INSIGHT_PARAM_KEY,
  )

  return (
    <Dialog
      open={Boolean(insightIsOpen)}
      onClose={() => setInsightIsOpen(false)}
      maxWidth='sm'
      fullWidth
      scroll='paper'
    >
      <DialogContent dividers>
        <HetCloseButton
          onClick={() => setInsightIsOpen(false)}
          ariaLabel='close insight report modal'
        />
        <InsightReportCard />
      </DialogContent>
    </Dialog>
  )
}
