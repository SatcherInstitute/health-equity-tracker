import { useState } from 'react'
import { SaveAlt } from '@mui/icons-material'
import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import SimpleBackdrop from '../../pages/ui/SimpleBackdrop'
import styles from './DownloadCardImageButton.module.scss'
import { type PopoverElements } from '../../utils/hooks/usePopover'

interface DownloadCardImageButtonProps {
  downloadTargetScreenshot: () => Promise<boolean>
  popover?: PopoverElements
  isMulti?: boolean
}

export function DownloadCardImageButton(props: DownloadCardImageButtonProps) {
  const [isThinking, setIsThinking] = useState(false)

  async function handleClick() {
    setIsThinking(true)
    setIsThinking(!(await props.downloadTargetScreenshot()))
    props.popover?.close()
  }

  return (
    <>
      <SimpleBackdrop open={isThinking} setOpen={setIsThinking} />
      <MenuItem
        className={styles.DownloadCardButton}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleClick}
      >
        <ListItemIcon className={styles.DownloadCardLinkIcon}>
          <SaveAlt className={styles.DownloadCardImageIcon} />
          {!props.isMulti && (
            <div className={styles.DownloadCardLinkText}>Save Image</div>
          )}
        </ListItemIcon>
      </MenuItem>
    </>
  )
}
