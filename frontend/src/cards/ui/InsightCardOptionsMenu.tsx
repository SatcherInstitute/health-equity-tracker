import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Tooltip } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import MenuList from '@mui/material/MenuList'
import Popover from '@mui/material/Popover'
import { HetCardExportMenuItem } from '../../styles/HetComponents/HetCardExportMenuItem'
import { usePopover } from '../../utils/hooks/usePopover'

interface InsightCardOptionsMenuProps {
  onClose: () => void
}

export default function InsightCardOptionsMenu({
  onClose,
}: InsightCardOptionsMenuProps) {
  const menu = usePopover()

  return (
    <>
      <Tooltip title='Card options'>
        <IconButton onClick={menu.open} aria-label='card options'>
          <MoreHorizIcon />
        </IconButton>
      </Tooltip>

      <Popover
        anchorEl={menu.anchor}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={menu.isOpen}
        onClose={menu.close}
      >
        <MenuList className='py-0'>
          <HetCardExportMenuItem
            Icon={CloseIcon}
            onClick={() => {
              onClose()
              menu.close()
            }}
          >
            Close
          </HetCardExportMenuItem>
        </MenuList>
      </Popover>
    </>
  )
}
