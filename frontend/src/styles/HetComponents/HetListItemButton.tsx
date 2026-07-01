import { ListItemButton } from '@mui/material'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

type HetListItemButtonOptionType = 'boldGreenCol' | 'normalBlack'

interface HetListItemButtonProps {
  children: ReactNode
  onClick?: () => void
  to?: string
  id?: string
  className?: string
  ariaLabel?: string
  selected?: boolean
  option?: HetListItemButtonOptionType
  style?: React.CSSProperties
  hoverStyle?: React.CSSProperties
}

const optionsToClasses: Record<HetListItemButtonOptionType, string> = {
  boldGreenCol: 'py-2 pl-0 font-sans-title text-small font-medium no-underline',
  normalBlack: 'py-1 pl-2 text-small font-light',
}

export default function HetListItemButton(props: HetListItemButtonProps) {
  const inner = (
    <span
      className={`${optionsToClasses[props.option ?? 'boldGreenCol']} ${
        props.className ?? ''
      }`}
    >
      {props.children}
    </span>
  )

  const sharedClassName = `mx-auto px-0 text-alt-green no-underline ${
    props.selected ? 'bg-hover-alt-green' : 'bg-alt-white'
  }`

  // When `to` is set, the whole row IS the router link — a single interactive
  // element so a click anywhere on the row navigates (no tiny nested anchor).
  if (props.to) {
    return (
      <ListItemButton
        component={Link}
        to={props.to}
        className={sharedClassName}
        aria-label={props.ariaLabel}
        selected={props.selected}
        role='menuitem'
      >
        {inner}
      </ListItemButton>
    )
  }

  return (
    <ListItemButton
      tabIndex={props.onClick ? undefined : -1}
      className={sharedClassName}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      selected={props.selected}
      role='menuitem'
    >
      {inner}
    </ListItemButton>
  )
}
