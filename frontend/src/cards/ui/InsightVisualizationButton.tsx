import AutoAwesome from '@mui/icons-material/AutoAwesome'
import DeleteForever from '@mui/icons-material/DeleteForever'
import { IconButton, Tooltip } from '@mui/material'
import { useAtom } from 'jotai'
import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import { useCompareMode } from '../../reports/CompareModeContext'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import {
  cardInsightOpenAtom,
  contrastInsightOpenAtom,
} from '../../utils/sharedSettingsState'

interface InsightVisualizationButtonProps {
  scrollToHash: ScrollableHashId
  isCompareCard?: boolean
}

export default function InsightVisualizationButton({
  scrollToHash,
  isCompareCard,
}: InsightVisualizationButtonProps) {
  const inCompareMode = useCompareMode()
  const [cardInsightOpen, setCardInsightOpen] = useAtom(cardInsightOpenAtom)
  const [contrastInsightOpen, setContrastInsightOpen] = useAtom(
    contrastInsightOpenAtom,
  )

  if (!SHOW_INSIGHT_GENERATION) return null

  // disableTouchListener: on touch devices a tap opens the tooltip and leaves it
  // covering the insight text it sits above. The aria-label carries the same
  // wording, so hover and screen reader users lose nothing.
  // Opening replaces the open insight rather than adding to it. Every open
  // insight is a model call, so one at a time keeps a reader from stacking them.
  if (inCompareMode) {
    const isOpen = contrastInsightOpen[scrollToHash] ?? false
    return (
      <Tooltip
        title={isOpen ? 'Clear comparison insights' : 'Comparison insights'}
        disableTouchListener
      >
        <IconButton
          className='hide-on-screenshot remove-height-on-screenshot'
          onClick={() =>
            setContrastInsightOpen(isOpen ? {} : { [scrollToHash]: true })
          }
          aria-label={
            isOpen ? 'Clear comparison insights' : 'Comparison insights'
          }
          size='small'
        >
          {isOpen ? <DeleteForever /> : <AutoAwesome className='text-base' />}
        </IconButton>
      </Tooltip>
    )
  }

  const openKey = `${scrollToHash}${isCompareCard ? '-2' : ''}`
  const isOpen = cardInsightOpen[openKey] ?? false
  return (
    <Tooltip
      title={isOpen ? 'Clear insight' : 'Generate AI insight'}
      disableTouchListener
    >
      <IconButton
        className='hide-on-screenshot remove-height-on-screenshot'
        onClick={() => setCardInsightOpen(isOpen ? {} : { [openKey]: true })}
        aria-label={isOpen ? 'Clear insight' : 'Generate insight'}
        size='small'
      >
        {isOpen ? <DeleteForever /> : <AutoAwesome className='text-base' />}
      </IconButton>
    </Tooltip>
  )
}
