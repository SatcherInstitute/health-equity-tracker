import { ListItemButton } from '@mui/material'
import type { ReactNode } from 'react'

type HetListItemButtonOptionType =
  | 'boldGreenCol'
  | 'boldGreenRow'
  | 'normalBlack'
  | 'topicOption'

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
  boldGreenCol: 'py-2 pl-0 font-sansTitle text-small font-medium no-underline',
  boldGreenRow: 'py-2 font-sansTitle text-small font-medium no-underline',
  normalBlack: 'py-1 pl-2 text-small font-light text-altBlack',
  topicOption:
    'py-1 pl-0 text-smallest sm:text-small font-roboto font-light text-altBlack leading-lhSomeMoreSpace',
}

export default function HetListItemButton(props: HetListItemButtonProps) {
  return (
    <ListItemButton
      tabIndex={props.onClick ? undefined : -1}
      className='px-0 mx-auto'
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      selected={props.selected}
    >
      <span
        className={`${optionsToClasses[props.option ?? 'boldGreenCol']} ${
          props.className ?? ''
        }`}
      >
        {props.children}
      </span>
    </ListItemButton>
  )
}
