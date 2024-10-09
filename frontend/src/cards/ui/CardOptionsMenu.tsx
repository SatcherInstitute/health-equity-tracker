import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Tooltip } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import MenuList from '@mui/material/MenuList'
import type { PopoverOrigin } from '@mui/material/Popover'
import Popover from '@mui/material/Popover'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { usePopover } from '../../utils/hooks/usePopover'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import CardShareIconButtons from './CardShareIconButtons'
import { CopyCardImageToClipboardButton } from './CopyCardImageToClipboardButton'
import CopyLinkButton from './CopyLinkButton'
import { DownloadCardImageButton } from './DownloadCardImageButton'

interface CardOptionsMenuProps {
  reportTitle: string
  scrollToHash: ScrollableHashId
}

export default function CardOptionsMenu(props: CardOptionsMenuProps) {
  const shareMenu = usePopover()
  const isSm = useIsBreakpointAndUp('sm')

  const anchorOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: 'right',
  }

  const transformOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: isSm ? 'left' : 'center',
  }

  return (
    <div className='mb-0 mr-0 flex flex-row-reverse pr-0 sm:mt-1 sm:pr-5 md:mr-1'>
      <Tooltip
        title='Card export options'
        className='hide-on-screenshot remove-height-on-screenshot'
      >
        <IconButton onClick={shareMenu.open}>
          <MoreHorizIcon />
        </IconButton>
      </Tooltip>

      <Popover
        anchorEl={shareMenu.anchor}
        anchorOrigin={anchorOrigin}
        open={shareMenu.isOpen}
        transformOrigin={transformOrigin}
        onClose={() => {
          shareMenu.close()
        }}
      >
        <MenuList className='pr-1'>
          <CopyLinkButton
            scrollToHash={props.scrollToHash}
            popover={shareMenu}
          />
          <CopyCardImageToClipboardButton
            scrollToHash={props.scrollToHash}
            popover={shareMenu}
          />
          <DownloadCardImageButton
            popover={shareMenu}
            scrollToHash={props.scrollToHash}
          />
          <CardShareIconButtons
            reportTitle={props.reportTitle}
            popover={shareMenu}
            scrollToHash={props.scrollToHash}
          />
        </MenuList>
      </Popover>
    </div>
  )
}
