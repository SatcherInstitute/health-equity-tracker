import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import type { ComponentType } from 'react'

interface HetCardExportMenuItemProps {
  Icon: ComponentType<any>
  onClick: () => void
  className?: string
  children?: React.ReactNode
  iconProps?: Record<string, any>
}

export function HetCardExportMenuItem({
  Icon,
  onClick,
  children,
  className = '',
  iconProps = {},
}: HetCardExportMenuItemProps) {
  return (
    <MenuItem className={`pl-3 ${className}`} onClick={onClick}>
      <ListItemIcon className='flex items-center px-2 py-1'>
        <Icon className='mx-1 w-8' {...iconProps} />
        {children && (
          <span className='text-altBlack text-small'>{children}</span>
        )}
      </ListItemIcon>
    </MenuItem>
  )
}
