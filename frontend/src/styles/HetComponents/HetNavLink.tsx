import { Link } from '@mui/material'
import type { ReactNode } from 'react'

interface HetNavLinkProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  id?: string
  className?: string
  linkClassName?: string
  ariaLabel?: string
  underline?: boolean
}

export default function HetNavLink(props: HetNavLinkProps) {
  return (
    <Link
      color='primary'
      href={props.href}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      className={`no-underline ${props.linkClassName ?? ''}`}>
      <span className={`px-6 flex items-center justify-center text-altBlack hover:text-altGreen ${props.className ?? ''}`}>
        {props.children}
      </span>
    </Link>
  )
}
