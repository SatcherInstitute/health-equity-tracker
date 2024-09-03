import { useState } from 'react'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import ListItemIcon from '@mui/material/ListItemIcon'
import LinkIcon from '@mui/icons-material/Link'
import MenuItem from '@mui/material/MenuItem'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import HetDialog from '../../styles/HetComponents/HetDialog'

interface CopyLinkButtonProps {
  popover: PopoverElements
  scrollToHash: ScrollableHashId
  urlWithHash: string
}

export default function CopyLinkButton(props: CopyLinkButtonProps) {
  const [open, setOpen] = useState(false)

  let cardName = props.scrollToHash.replaceAll('-', ' ') ?? 'Card'
  cardName = cardName[0].toUpperCase() + cardName.slice(1)

  const title = `Copy direct link to: ${cardName}`

  function handleClick() {
    async function asyncHandleClick() {
      await navigator.clipboard.writeText(props.urlWithHash)
      setOpen(true)
    }
    asyncHandleClick().catch((error) => error)
  }

  function handleClose() {
    setOpen(false)
    props.popover.close()
  }

  return (
    <>
      <MenuItem aria-label={title} onClick={handleClick} className='pl-3'>
        <ListItemIcon className='flex items-center px-2 py-1'>
          <LinkIcon className='mx-1 w-8' />
          <div className='pl-1 text-altBlack'>Copy card link</div>
        </ListItemIcon>
      </MenuItem>

      <HetDialog open={open} cardName={cardName} handleClose={handleClose} />
    </>
  )
}
