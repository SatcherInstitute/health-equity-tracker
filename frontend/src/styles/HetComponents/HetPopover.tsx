import { Popover } from '@mui/material'
import type { ReactNode } from 'react'
import type { PopoverElements } from '../../utils/hooks/usePopover'

interface HetPopoverProps {
  children: ReactNode
  popover: PopoverElements
}

export default function HetPopover(props: HetPopoverProps) {
  return (
    <Popover
      className='m-4 flex'
      aria-expanded='true'
      open={props.popover.isOpen}
      anchorEl={props.popover.anchor}
      onClose={props.popover.close}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      {props.children}
    </Popover>
  )
}
