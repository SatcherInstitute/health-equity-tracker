import { Tooltip } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import MenuList from '@mui/material/MenuList'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Popover from '@mui/material/Popover'
import type { PopoverOrigin } from '@mui/material/Popover'
import { DownloadCardImageButton } from './DownloadCardImageButton'
import CopyLinkButton from './CopyLinkButton'
import CardShareIcons from './CardShareIcons'
import { usePopover } from '../../utils/hooks/usePopover'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'

interface CardOptionsMenuProps {
  downloadTargetScreenshot: () => Promise<boolean>
  reportTitle: string
  scrollToHash: ScrollableHashId
}

export default function CardOptionsMenu(props: CardOptionsMenuProps) {
  const shareMenu = usePopover()
  const isSm = useIsBreakpointAndUp('sm')

  const urlWithoutHash = window.location.href.split('#')[0]
  const urlWithHash = `${urlWithoutHash}#${props.scrollToHash}`

  const anchorOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: 'right',
  }

  const transformOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: isSm ? 'left' : 'center',
  }

  return (
    <div
      className='mb-0 mr-0 flex flex-row-reverse pr-0 sm:mt-1 sm:pr-5 md:mr-1'
      id={'card-options-menu'}
    >
      <Tooltip title='Card export options'>
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
            urlWithHash={urlWithHash}
          />
          <DownloadCardImageButton
            downloadTargetScreenshot={props.downloadTargetScreenshot}
            popover={shareMenu}
          />
          <CardShareIcons
            reportTitle={props.reportTitle}
            popover={shareMenu}
            urlWithHash={urlWithHash}
          />
        </MenuList>
      </Popover>
    </div>
  )
}
