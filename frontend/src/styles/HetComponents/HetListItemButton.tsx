import { ListItemButton } from '@mui/material'
import type { ReactNode } from 'react'

type HetListItemButtonOptionType = 'boldGreen' | 'normalBlack' | 'topicOption'

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
  boldGreen: 'py-2 pl-0 font-sansTitle text-small font-medium no-underline',
  normalBlack: 'py-1 pl-2 text-small font-light text-altBlack',
  topicOption:
    'py-1 pl-0 text-smallest sm:text-small font-roboto font-light text-altBlack leading-lhSomeMoreSpace',
}

export default function HetListItemButton(props: HetListItemButtonProps) {
  return (
    <ListItemButton
      tabIndex={props.onClick ? undefined : -1}
      className='p-0'
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      selected={props.selected}
    >
      <span
        className={`${optionsToClasses[props.option ?? 'boldGreen']} ${
          props.className ?? ''
        }`}
      >
        {props.children}
      </span>
    </ListItemButton>
  )
}
