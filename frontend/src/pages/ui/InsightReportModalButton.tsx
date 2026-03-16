import { AutoAwesome } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useParamState } from '../../utils/hooks/useParamState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'

interface InsightReportModalButtonProps {
  onInsightClick?: () => void
}

export default function ReportInsightModalButton(
  props: InsightReportModalButtonProps,
) {
  const [, setReportInsightModalIsOpen] = useParamState<boolean>(
    REPORT_INSIGHT_PARAM_KEY,
    false,
  )

  const handleClick = () => {
    setReportInsightModalIsOpen(true)
    props.onInsightClick?.()
  }

  return (
    <Button
      onClick={handleClick}
      className='text-alt-black text-smallest'
      aria-label='open the AI report insight'
    >
      <AutoAwesome sx={{ mr: '4px' }} fontSize='small' />
      Generate report insight
    </Button>
  )
}
