import AutoAwesome from '@mui/icons-material/AutoAwesome'
import DeleteForever from '@mui/icons-material/DeleteForever'
import { IconButton, Tooltip } from '@mui/material'
import { useAtom } from 'jotai'
import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { cardInsightOpenAtom } from '../../utils/sharedSettingsState'

interface InsightVisualizationButtonProps {
  scrollToHash: ScrollableHashId
}

export default function InsightVisualizationButton({
  scrollToHash,
}: InsightVisualizationButtonProps) {
  const [cardInsightOpen, setCardInsightOpen] = useAtom(cardInsightOpenAtom)
  const isOpen = cardInsightOpen[scrollToHash] ?? false

  if (!SHOW_INSIGHT_GENERATION) return null

  return (
    <Tooltip title={isOpen ? 'Clear insight' : 'Generate AI insight'}>
      <IconButton
        onClick={() =>
          setCardInsightOpen((prev) => ({ ...prev, [scrollToHash]: !isOpen }))
        }
        aria-label={isOpen ? 'Clear insight' : 'Generate insight'}
        size='small'
      >
        {isOpen ? (
          <DeleteForever fontSize='small' className='hide-on-screenshot' />
        ) : (
          <AutoAwesome fontSize='small' />
        )}
      </IconButton>
    </Tooltip>
  )
}
