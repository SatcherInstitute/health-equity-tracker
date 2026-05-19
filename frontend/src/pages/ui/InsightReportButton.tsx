import AutoAwesome from '@mui/icons-material/AutoAwesome'
import { Button } from '@mui/material'
import { useParamState } from '../../utils/hooks/useParamState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'

interface InsightReportButtonProps {
  onInsightClick?: () => void
  variant?: 'text' | 'outlined'
  label?: string
}

export default function InsightReportButton(props: InsightReportButtonProps) {
  const [insightIsOpen, setInsightIsOpen] = useParamState<boolean>(
    REPORT_INSIGHT_PARAM_KEY,
    false,
  )

  const handleClick = () => {
    setInsightIsOpen(!insightIsOpen)
    props.onInsightClick?.()
  }

  return (
    <Button
      onClick={handleClick}
      variant={props.variant ?? 'text'}
      className={`font-roboto text-alt-black text-smallest normal-case ${props.variant === 'outlined' ? 'rounded-sm border-light-outline px-3.5 py-[8.5px] font-medium hover:border-border-color hover:bg-transparent' : 'font-normal'}`}
      aria-label='open the AI report insight'
    >
      <AutoAwesome className='mr-2 text-base text-hex-share-icon-gray' />
      {props.label ?? 'Report insights'}
    </Button>
  )
}
