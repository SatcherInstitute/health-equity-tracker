import AutoAwesome from '@mui/icons-material/AutoAwesome'
import { Button } from '@mui/material'
import { useParamState } from '../../utils/hooks/useParamState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'

interface InsightReportButtonProps {
  onInsightClick?: () => void
  variant?: 'text' | 'outlined'
}

export default function InsightReportButton(props: InsightReportButtonProps) {
  const [, setInsightIsOpen] = useParamState<boolean>(
    REPORT_INSIGHT_PARAM_KEY,
    false,
  )

  const handleClick = () => {
    setInsightIsOpen(true)
    props.onInsightClick?.()
  }

  return (
    <Button
      onClick={handleClick}
      variant={props.variant ?? 'text'}
      className='font-roboto text-alt-black text-smallest'
      aria-label='open the AI report insight'
    >
      <AutoAwesome className='mr-1 text-base' />
      Report insights
    </Button>
  )
}
