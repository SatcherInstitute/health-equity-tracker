import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import type { ComponentType } from 'react'

interface HetCardExportMenuItemProps {
  Icon: ComponentType<any>
  onClick: () => void
  className?: string
  children?: React.ReactNode
  iconProps?: Record<string, any>
  spanClassName?: string
  iconClassName?: string
}

export function HetCardExportMenuItem({
  Icon,
  onClick,
  children,
  className = '',
  iconProps = {},
  spanClassName,
  iconClassName,
}: HetCardExportMenuItemProps) {
  return (
    <MenuItem className={`pl-3 ${className}`} onClick={onClick}>
      <ListItemIcon
        className={`${iconClassName} flex w-full items-center px-2 py-1`}
      >
        <Icon className='mx-1 w-8' {...iconProps} />
        {children && (
          <span className={`text-alt-black text-small ${spanClassName}`}>
            {children}
          </span>
        )}
      </ListItemIcon>
    </MenuItem>
  )
}
