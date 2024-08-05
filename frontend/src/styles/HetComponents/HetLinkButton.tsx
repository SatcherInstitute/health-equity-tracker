import { Button } from '@mui/material'
import type { ReactNode } from 'react'

interface HetLinkButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  id?: string
  className?: string
  buttonClassName?: string
  ariaLabel?: string
  underline?: boolean
}

export default function HetLinkButton(props: HetLinkButtonProps) {
  return (
    <Button
      color='primary'
      href={props.href}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      className={props.buttonClassName}
    >
      <span className={`px-6 text-altGreen ${props.className ?? ''}`}>
        {props.children}
      </span>
    </Button>
  )
}
