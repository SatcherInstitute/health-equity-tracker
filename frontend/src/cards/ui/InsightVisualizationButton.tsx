import { AutoAwesome, DeleteForever } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { useAtom } from 'jotai'
import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { cardInsightOpenAtom } from '../../utils/sharedSettingsState'

interface InsightVisualizationButtonProps {
  scrollToHash: ScrollableHashId
  hasData?: boolean
}

export default function InsightVisualizationButton({
  scrollToHash,
  hasData = true,
}: InsightVisualizationButtonProps) {
  const [cardInsightOpen, setCardInsightOpen] = useAtom(cardInsightOpenAtom)
  const isOpen = cardInsightOpen[scrollToHash] ?? false

  if (!SHOW_INSIGHT_GENERATION || !hasData) return null

  return (
    <div className='absolute top-5 right-20'>
      <Tooltip title={isOpen ? 'Clear insight' : 'Generate AI insight'}>
        <IconButton
          onClick={() =>
            setCardInsightOpen((prev) => ({ ...prev, [scrollToHash]: !isOpen }))
          }
          aria-label={isOpen ? 'Clear insight' : 'Generate insight'}
          size='small'
        >
          {isOpen ? (
            <DeleteForever fontSize='small' />
          ) : (
            <AutoAwesome fontSize='small' />
          )}
        </IconButton>
      </Tooltip>
    </div>
  )
}
