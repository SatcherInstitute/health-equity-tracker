import { Dialog, DialogContent, Drawer } from '@mui/material'
import type { ReactNode } from 'react'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import HetCloseButton from './HetCloseButton'

interface HetResponsiveDialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** aria-label for the X close button; omit to suppress the header bar entirely */
  onCloseLabel?: string
  /** rendered left of the X button in the header (e.g. CardOptionsMenu) */
  headerActions?: ReactNode
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  dialogPaperStyle?: React.CSSProperties
  dialogClassName?: string
  ariaLabelledBy?: string
  /** aria-label for the Drawer paper element (accessibility) */
  ariaLabel?: string
}

export default function HetResponsiveDialog({
  open,
  onClose,
  children,
  onCloseLabel,
  headerActions,
  maxWidth = 'lg',
  fullWidth = false,
  dialogPaperStyle,
  dialogClassName,
  ariaLabelledBy,
  ariaLabel,
}: HetResponsiveDialogProps) {
  const isSmAndUp = useIsBreakpointAndUp('sm')

  const header = onCloseLabel ? (
    <div className='flex shrink-0 items-center p-2'>
      {headerActions && <div>{headerActions}</div>}
      <HetCloseButton
        onClick={onClose}
        ariaLabel={onCloseLabel}
        className='ml-auto text-alt-black'
      />
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
          },
        }}
      >
        {header}
        <div className='flex-1 overflow-y-auto'>{children}</div>
      </Drawer>
    )
  }

  return (
    <Dialog
      className={dialogClassName}
      aria-labelledby={ariaLabelledBy}
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll='paper'
      slotProps={
        dialogPaperStyle ? { paper: { style: dialogPaperStyle } } : undefined
      }
    >
      {header}
      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  )
}
