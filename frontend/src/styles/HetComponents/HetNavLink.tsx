import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

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
}: HetNavLinkProps) {
  return (
    <Link
      color='primary'
      to={href || '#'}
      onClick={onClick}
      aria-label={ariaLabel}
      id={id}
      className={`no-underline cursor-pointer flex items-center ${linkClassName ?? ''}`}
    >
      <span
        className={`hover:text-altGreen w-auto font-sansTitle text-small font-medium text-navlinkColor ${className ?? 'mx-6'}`}
      >
        {children}
      </span>
    </Link>
  )
}
