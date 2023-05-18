import { useState } from 'react'
import { IconButton, Snackbar, Alert } from '@mui/material'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import LinkIcon from '@mui/icons-material/Link'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import styles from './CopyLinkButton.module.scss'

interface CopyLinkButtonProps {
  scrollToHash: ScrollableHashId
}

export default function CopyLinkButton(props: CopyLinkButtonProps) {
  const [open, setOpen] = useState(false)

  const urlWithoutHash = window.location.href.split('#')[0]
  const cardHashLink = `${urlWithoutHash}#${props.scrollToHash}`

  let cardName = props.scrollToHash.replaceAll('-', ' ') ?? 'Card'
  cardName = cardName[0].toUpperCase() + cardName.slice(1)

  const title = `Copy direct link to: ${cardName}`

  function handleClose() {
    setOpen(false)
  }

  function handleClick() {
    async function asyncHandleClick() {
      await navigator.clipboard.writeText(cardHashLink)
      setOpen(true)
    }
    asyncHandleClick().catch((error) => error)
  }

  return (
    <>
      <ListItemIcon>
        <IconButton
          aria-label={title}
          className={styles.CopyLinkButton}
          onClick={handleClick}
          sx={{ width: '3rem', height: '3rem' }}
        >
          <LinkIcon />
        </IconButton>
      </ListItemIcon>
      <ListItemText primary={'Copy card link'} />
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} className={styles.SnackBarAlert}>
          Direct link to <b>{cardName}</b> copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  )
}
