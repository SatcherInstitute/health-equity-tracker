import AutoAwesome from '@mui/icons-material/AutoAwesome'
import DeleteForever from '@mui/icons-material/DeleteForever'
import { IconButton, Tooltip } from '@mui/material'
import { useAtom } from 'jotai'
import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { cardInsightOpenAtom } from '../../utils/sharedSettingsState'

interface InsightVisualizationButtonProps {
  scrollToHash: ScrollableHashId
  isCompareCard?: boolean
}

export default function InsightVisualizationButton({
  scrollToHash,
  isCompareCard,
}: InsightVisualizationButtonProps) {
  const [cardInsightOpen, setCardInsightOpen] = useAtom(cardInsightOpenAtom)
  const openKey = `${scrollToHash}${isCompareCard ? '-2' : ''}`
  const isOpen = cardInsightOpen[openKey] ?? false

  if (!SHOW_INSIGHT_GENERATION) return null

  return (
    <Tooltip title={isOpen ? 'Clear insight' : 'Generate AI insight'}>
      <IconButton
        onClick={() =>
          setCardInsightOpen((prev) => ({ ...prev, [openKey]: !isOpen }))
        }
        aria-label={isOpen ? 'Clear insight' : 'Generate insight'}
        size='small'
      >
        {isOpen ? (
          <DeleteForever className='hide-on-screenshot remove-height-on-screenshot' />
        ) : (
          <AutoAwesome className='text-base' />
        )}
      </IconButton>
    </Tooltip>
  )
}
