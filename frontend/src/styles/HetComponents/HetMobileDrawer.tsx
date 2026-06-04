import { Drawer } from '@mui/material'
import type { ReactNode } from 'react'

interface HetMobileDrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel?: string
  paperStyle?: React.CSSProperties
}

export default function HetMobileDrawer({
  open,
  onClose,
  children,
  ariaLabel,
  paperStyle,
}: HetMobileDrawerProps) {
  return (
    <Drawer
      anchor='bottom'
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          style: {
            borderRadius: '16px 16px 0 0',
            maxHeight: '90vh',
            ...paperStyle,
          },
          'aria-label': ariaLabel,
        },
      }}
    >
      <div className='overflow-y-auto'>{children}</div>
    </Drawer>
  )
}
