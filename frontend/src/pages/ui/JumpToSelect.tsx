import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useRef } from 'react'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import { scrollToHashTarget } from '../../utils/hooks/useScrollToHash'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'

interface JumpToSelectProps {
  reportStepHashIds: ScrollableHashId[]
  label?: string
  minWidth?: number
}

export default function JumpToSelect(props: JumpToSelectProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const label = props.label ?? 'Jump to'
  // MUI hands focus back to the select once its menu finishes closing, which
  // lands after onChange and would undo the focus scrollToHashTarget puts on the
  // card. Holding the choice until the menu has closed is what lets a keyboard
  // user end up on the card rather than back on the menu they just used.
  const pendingHashId = useRef<string | null>(null)

  // the same list the desktop sidebar renders: ids whose cards actually made it
  // into the DOM for this topic and geography. A card the report suppressed for
  // lack of data never enters it, so the menu cannot offer a link to nothing.
  // multimap-modal is in the step list but carries no label, since it is a modal
  // rather than a destination on the page.
  const options = props.reportStepHashIds.filter(
    (stepId) => reportProviderSteps[stepId]?.label,
  )

  return (
    <FormControl sx={{ m: 1, minWidth: props.minWidth ?? 110 }} size='small'>
      <InputLabel id='jump-to-select-label'>{label}</InputLabel>
      <Select
        autoWidth
        labelId='jump-to-select-label'
        id='jump-to-select'
        // never holds a selection: picking an option is a navigation, not a
        // setting, so it resets and the same card can be chosen again
        value=''
        label={label}
        onChange={(e) => {
          pendingHashId.current = e.target.value
        }}
        MenuProps={{
          slotProps: {
            transition: {
              onExited: () => {
                const hashId = pendingHashId.current
                pendingHashId.current = null
                if (hashId) {
                  scrollToHashTarget(hashId, { smooth: !prefersReducedMotion })
                }
              },
            },
          },
        }}
      >
        {options.map((stepId) => (
          <MenuItem key={stepId} value={stepId}>
            {reportProviderSteps[stepId].label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
