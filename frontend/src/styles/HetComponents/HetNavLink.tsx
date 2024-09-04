import { Link } from '@mui/material'
import type { ReactNode } from 'react'

interface HetNavLinkProps {
  children: ReactNode
  href?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  id?: string
  className?: string
  linkClassName?: string
  ariaLabel?: string
  underline?: boolean
}

export default function HetNavLink({
  children,
  href,
  onClick,
  id,
  className,
  linkClassName,
  ariaLabel,
  underline = false,
}: HetNavLinkProps) {
  return (
    <Link
      color='primary'
      href={href || '#'}
      onClick={onClick}
      aria-label={ariaLabel}
      id={id}
      underline={underline ? 'always' : 'none'}
      className={`no-underline cursor-pointer flex items-center ${linkClassName ?? ''}`}
    >
      <span
        className={`mx-6 text-altBlack hover:text-altGreen w-auto font-sansTitle text-small font-medium text-navlinkColor ${className ?? ''}`}
      >
        {children}
      </span>
    </Link>
  )
}
