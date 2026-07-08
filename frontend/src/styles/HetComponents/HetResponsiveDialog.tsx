import { Dialog, DialogContent, Drawer } from '@mui/material'
import type { ReactNode } from 'react'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import HetCloseButton from './HetCloseButton'

interface HetResponsiveDialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  headerActions?: ReactNode
  fullWidth?: boolean
  dialogClassName?: string
  ariaLabel: string
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  // 'full' fixes the desktop dialog to 95vh (use for iframes/map grids that need all the space)
  // 'content' caps at 90vh and lets content determine height (default)
  dialogHeight?: 'full' | 'content'
}

export default function HetResponsiveDialog({
  open,
  onClose,
  children,
  headerActions,
  fullWidth = false,
  dialogClassName,
  ariaLabel,
  maxWidth = false,
  dialogHeight = 'content',
}: HetResponsiveDialogProps) {
  const isSmAndUp = useIsBreakpointAndUp('sm')

  const header = (
    <div className='flex shrink-0 items-center p-3 sm:p-2'>
      <div className='ml-auto flex items-center'>
        {headerActions}
        <HetCloseButton
          onClick={onClose}
          ariaLabel='close dialog'
          className='text-alt-black'
        />
      </div>
    </div>
  )

  if (!isSmAndUp) {
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
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
            'aria-label': ariaLabel,
          },
        }}
      >
        {header}
        <div className='flex-1 overflow-y-auto p-4'>{children}</div>
      </Drawer>
    )
  }

  return (
    <Dialog
      className={dialogClassName}
      aria-label={ariaLabel}
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll='paper'
      slotProps={{
        paper: {
          style:
            dialogHeight === 'full'
              ? { height: '95vh' }
              : { maxHeight: '90vh' },
        },
      }}
    >
      {header}
      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  )
}
