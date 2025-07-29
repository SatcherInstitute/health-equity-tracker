import { ListItemButton } from '@mui/material'
import type { ReactNode } from 'react'

type HetListItemButtonOptionType = 'boldGreenCol' | 'normalBlack'

interface HetListItemButtonProps {
  children: ReactNode
  onClick?: () => void
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
  normalBlack: 'py-1 pl-2 text-small font-light text-alt-black',
}

export default function HetListItemButton(props: HetListItemButtonProps) {
  return (
    <ListItemButton
      tabIndex={props.onClick ? undefined : -1}
      className={`mx-auto px-0 ${props.selected ? 'bg-hover-alt-green' : 'bg-white'}`}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      selected={props.selected}
      role='menuitem'
    >
      <span
        className={`${optionsToClasses[props.option ?? 'boldGreenCol']}${
          props.className ?? ''
        }`}
      >
        {props.children}
      </span>
    </ListItemButton>
  )
}
