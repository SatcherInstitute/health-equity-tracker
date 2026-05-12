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
      color='inherit'
      href={props.href}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      className={`px-6 ${props.className ?? ''} ${props.buttonClassName ?? ''}`}
    >
      {props.children}
    </Button>
  )
}
