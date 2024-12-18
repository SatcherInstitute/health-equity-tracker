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
      className={`flex cursor-pointer items-center no-underline ${linkClassName ?? ''}`}
    >
      <span
        className={`w-auto font-medium font-sansTitle text-navlinkColor text-small hover:text-altGreen ${className ?? 'mx-6'}`}
      >
        {children}
      </span>
    </Link>
  )
}
