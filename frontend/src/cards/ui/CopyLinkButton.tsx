import { useState } from 'react'
import LinkIcon from '@mui/icons-material/Link'
import styles from './CopyLinkButton.module.scss'
import { IconButton, Snackbar, Alert, Tooltip } from '@mui/material'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'

interface CopyLinkButtonProps {
  scrollToHash: ScrollableHashId
}

export default function CopyLinkButton(props: CopyLinkButtonProps) {
  const [open, setOpen] = useState(false)

  const urlWithoutHash = window.location.href.split('#')[0]
  const cardHashLink = `${urlWithoutHash}#${props.scrollToHash}`

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

  let cardName = props.scrollToHash.replaceAll('-', ' ')
  cardName = cardName[0].toUpperCase() + cardName.slice(1)

  const title = `Copy direct link to: ${cardName}`

  return (
    <>
      <Tooltip title={title}>
        <IconButton
          className={styles.CopyLinkButton}
          aria-label={title}
          onClick={handleClick}
          sx={{ width: '3rem', height: '3rem' }}
        >
          <LinkIcon />
        </IconButton>
      </Tooltip>
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} className={styles.SnackBarAlert}>
          Direct link to <b>{cardName}</b> copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  )
}
