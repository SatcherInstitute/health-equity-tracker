import { Dialog, DialogContent, Drawer } from '@mui/material'
import type { ReactNode } from 'react'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import HetCloseButton from './HetCloseButton'

interface HetResponsiveDialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  onCloseLabel?: string
  headerActions?: ReactNode
  fullWidth?: boolean
  dialogClassName?: string
  ariaLabelledBy?: string
  ariaLabel?: string
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fitContent?: boolean
}

export default function HetResponsiveDialog({
  open,
  onClose,
  children,
  onCloseLabel,
  headerActions,
  fullWidth = false,
  dialogClassName,
  ariaLabelledBy,
  ariaLabel,
  maxWidth = false,
  fitContent = false,
}: HetResponsiveDialogProps) {
  const isSmAndUp = useIsBreakpointAndUp('sm')

  const header = onCloseLabel ? (
    <div className='flex shrink-0 items-center p-3 sm:p-2'>
      <div className='ml-auto flex items-center'>
        {headerActions}
        <HetCloseButton
          onClick={onClose}
          ariaLabel={onCloseLabel}
          className='text-alt-black'
        />
      </div>
    </div>
  ) : null

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
            'aria-labelledby': ariaLabelledBy,
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
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll='paper'
      slotProps={{
        paper: {
          style: fitContent ? { maxHeight: '90vh' } : { height: '95vh' },
        },
      }}
    >
      {header}
      <DialogContent dividers className='!p-4'>
        {children}
      </DialogContent>
    </Dialog>
  )
}
