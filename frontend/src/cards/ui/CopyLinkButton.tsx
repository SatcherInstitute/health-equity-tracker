import { useState } from 'react'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import ListItemIcon from '@mui/material/ListItemIcon'
import LinkIcon from '@mui/icons-material/Link'
import MenuItem from '@mui/material/MenuItem'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import HetDialog from '../../styles/HetComponents/HetDialog'
import HetTerm from '../../styles/HetComponents/HetTerm'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'

interface CopyLinkButtonProps {
  popover: PopoverElements
  scrollToHash: ScrollableHashId
  urlWithHash: string
}

export default function CopyLinkButton(props: CopyLinkButtonProps) {
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const cardName = reportProviderSteps[props.scrollToHash].label
  const ariaLabel = `Copy direct link to: ${cardName}`

  function handleClick() {
    async function asyncHandleClick() {
      await navigator.clipboard.writeText(props.urlWithHash)
      setConfirmationOpen(true)
    }
    asyncHandleClick().catch((error) => error)
  }

  function handleClose() {
    setConfirmationOpen(false)
    props.popover.close()
  }

  return (
    <>
      <MenuItem aria-label={ariaLabel} onClick={handleClick} className='pl-3'>
        <ListItemIcon className='flex items-center px-2 py-1'>
          <LinkIcon className='mx-1 w-8' />
          <div className='pl-1 text-altBlack'>Copy Card Link</div>
        </ListItemIcon>
      </MenuItem>

      <HetDialog open={confirmationOpen} handleClose={handleClose}>
        Direct link to <HetTerm>{cardName}</HetTerm> copied to clipboard!
      </HetDialog>
    </>
  )
}
