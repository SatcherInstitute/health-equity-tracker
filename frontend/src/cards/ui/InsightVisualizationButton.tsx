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

  if (inCompareMode) {
    const isOpen = contrastInsightOpen[scrollToHash] ?? false
    return (
      <Tooltip
        title={isOpen ? 'Clear comparison insights' : 'Comparison insights'}
      >
        <IconButton
          className='hide-on-screenshot remove-height-on-screenshot'
          onClick={() =>
            setContrastInsightOpen((prev) => ({
              ...prev,
              [scrollToHash]: !isOpen,
            }))
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
    <Tooltip title={isOpen ? 'Clear insight' : 'Generate AI insight'}>
      <IconButton
        className='hide-on-screenshot remove-height-on-screenshot'
        onClick={() =>
          setCardInsightOpen((prev) => ({ ...prev, [openKey]: !isOpen }))
        }
        aria-label={isOpen ? 'Clear insight' : 'Generate insight'}
        size='small'
      >
        {isOpen ? <DeleteForever /> : <AutoAwesome className='text-base' />}
      </IconButton>
    </Tooltip>
  )
}
