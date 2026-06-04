import { Drawer } from '@mui/material'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import { useParamState } from '../../utils/hooks/useParamState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'
import InsightReportCard from '../ExploreData/InsightReportCard'

export default function InsightReportModal() {
  const [insightIsOpen, setInsightIsOpen] = useParamState(
    REPORT_INSIGHT_PARAM_KEY,
  )
  const close = () => setInsightIsOpen(false)

  return (
    <Drawer
      anchor='bottom'
      open={Boolean(insightIsOpen)}
      onClose={close}
      slotProps={{
        paper: { style: { borderRadius: '16px 16px 0 0', maxHeight: '90vh' } },
      }}
    >
      <div
        role='dialog'
        aria-modal={true}
        aria-label='AI Report Summary'
        className='overflow-y-auto'
      >
        <div className='flex justify-end p-2'>
          <HetCloseButton onClick={close} ariaLabel='close AI report summary' />
        </div>
        <InsightReportCard />
      </div>
    </Drawer>
  )
}
