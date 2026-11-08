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
      className={`font-roboto text-alt-dark text-smallest normal-case ${props.variant === 'outlined' ? 'border-light-outline hover:border-border-color rounded-sm px-3.5 py-[8.5px] font-medium hover:bg-transparent' : 'font-normal'}`}
      aria-label='open the AI report insight'
    >
      <AutoAwesome className='text-hex-share-icon-gray mr-2 text-base' />
      {props.label ?? 'Report insights'}
    </Button>
  )
}
