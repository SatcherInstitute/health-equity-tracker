import { useState } from 'react'
import { Snackbar, Alert } from '@mui/material'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import ListItemIcon from '@mui/material/ListItemIcon'
import LinkIcon from '@mui/icons-material/Link'
import MenuItem from '@mui/material/MenuItem'
import { type PopoverElements } from '../../utils/hooks/usePopover'
import styles from './CopyLinkButton.module.scss'

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
      <MenuItem
        aria-label={title}
        onClick={handleClick}
        className={styles.CopyLinkButton}
      >
        <ListItemIcon className={styles.CopyLinkIcon}>
          <LinkIcon className={styles.LinkIcon} />
          <div className={styles.CopyCardLinkText}>Copy card link</div>
        </ListItemIcon>
      </MenuItem>
      <Snackbar open={open} autoHideDuration={1000} onClose={handleClose}>
        <Alert onClose={handleClose} className={styles.SnackBarAlert}>
          Direct link to <b>{cardName}</b> copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  )
}
