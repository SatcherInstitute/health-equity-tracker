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
<<<<<<< HEAD
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
=======
      href={props.href}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      className={`no-underline ${props.linkClassName ?? ''}`}>
      <span className={`py-2 px-6 flex items-center justify-center text-altBlack hover:text-altGreen my-0 w-auto font-sansTitle text-small font-medium text-navlinkColor ${props.className ?? ''}`}>
        {props.children}
>>>>>>> 8bb0b569 (create hetnavbutton, start adding menu folders)
      </span>
    </Link>
  )
}