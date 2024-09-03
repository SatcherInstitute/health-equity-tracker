import { useState } from 'react'
import { SaveAlt } from '@mui/icons-material'
import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import SimpleBackdrop from '../../pages/ui/SimpleBackdrop'
import type { PopoverElements } from '../../utils/hooks/usePopover'

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
        className='pl-3'
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleClick}
      >
        <ListItemIcon className='flex items-center px-2 py-1'>
          <SaveAlt className='mx-1 w-8' />
          {!props.isMulti && (
            <div className='pl-1 text-altBlack'>Save Image</div>
          )}
        </ListItemIcon>
      </MenuItem>
    </>
  )
}
