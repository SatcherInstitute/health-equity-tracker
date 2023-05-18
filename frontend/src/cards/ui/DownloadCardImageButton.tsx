import { useState } from 'react'
import { SaveAlt } from '@mui/icons-material'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import SimpleBackdrop from '../../pages/ui/SimpleBackdrop'
import styles from './DownloadCardImageButton.module.scss'

interface DownloadCardImageButtonProps {
  downloadTargetScreenshot: () => Promise<boolean>
}

export function DownloadCardImageButton(props: DownloadCardImageButtonProps) {
  const [isThinking, setIsThinking] = useState(false)

  async function takeScreenshot(this: any) {
    setIsThinking(true)
    setIsThinking(!(await props.downloadTargetScreenshot()))
  }

  return (
    <>
      <SimpleBackdrop open={isThinking} setOpen={setIsThinking} />
      <MenuItem
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={takeScreenshot}>
        <ListItemIcon className={styles.DownloadCardImageButton}>
          <SaveAlt />
        </ListItemIcon>
        <ListItemText primary={'Save image'} />
      </MenuItem>
    </>
  )
}
