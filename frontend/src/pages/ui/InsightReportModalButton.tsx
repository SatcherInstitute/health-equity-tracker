import { AutoAwesome } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useParamState } from '../../utils/hooks/useParamState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'

export default function ReportInsightModalButton() {
  const [, setReportInsightModalIsOpen] = useParamState<boolean>(
    REPORT_INSIGHT_PARAM_KEY,
    false,
  )

  return (
    <Button
      onClick={() => setReportInsightModalIsOpen(true)}
      className='text-alt-black text-smallest'
      aria-label='open the AI report insight modal'
    >
      <AutoAwesome sx={{ mr: '4px' }} fontSize='small' />
      Generate report insight
    </Button>
  )
}
