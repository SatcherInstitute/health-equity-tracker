import { useState } from 'react'
import SimpleBackdrop from '../../pages/ui/SimpleBackdrop'
import styles from './DownloadCardImageButton.module.scss'
import { Tooltip, IconButton } from '@mui/material'
import { SaveAlt } from '@mui/icons-material'

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
      <Tooltip title={'Save card image'}>
        <IconButton
          className={styles.DownloadCardImageButton}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={takeScreenshot}
          sx={{ width: '3rem', height: '3rem' }}
        >
          <SaveAlt />
        </IconButton>
      </Tooltip>
    </>
  )
}
