import { ListItemButton } from '@mui/material'
import type { ReactNode } from 'react'

interface HetListBoxOptionProps {
  children: ReactNode
  onClick?: () => void
  id?: string
  className?: string
  ariaLabel?: string
  selected?: boolean
  style?: React.CSSProperties
  hoverStyle?: React.CSSProperties
}

export default function HetListBoxOption(props: HetListBoxOptionProps) {
  return (
    <ListItemButton
      tabIndex={props.onClick ? undefined : -1}
      className={`mx-auto px-0 ${props.selected ? 'bg-hover-alt-green' : 'bg-white'}`}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      selected={props.selected}
      component='li'
      role='menuitem'
    >
      <span
        className={`py-0 pl-0 font-light font-roboto text-alt-black text-smallest leading-lh-some-more-space sm:text-small ${props.className ?? ''}`}
      >
        {props.children}
      </span>
    </ListItemButton>
  )
}
