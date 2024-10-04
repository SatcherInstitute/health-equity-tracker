import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import type { SvgIconComponent } from '@mui/icons-material'
import { text } from 'd3'

interface HetCardExportMenuItemProps {
  Icon: SvgIconComponent
  onClick: () => void
  className?: string
  children?: React.ReactNode
}

export function HetCardExportMenuItem({
  Icon,
  onClick,
  children,
  className = '',
}: HetCardExportMenuItemProps) {
  return (
    <MenuItem className={`pl-3 ${className}`} onClick={onClick}>
      <ListItemIcon className='flex items-center px-2 py-1'>
        <Icon className='mx-1 w-8' />
        {children && <div className='pl-1 text-altBlack'>{children}</div>}
      </ListItemIcon>
    </MenuItem>
  )
}
