import { Button } from '@mui/material'
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router'
import { isExternalLink } from '../../utils/urlutils'

interface HetButtonSecondaryProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  buttonClassName?: string
  ariaLabel?: string
  underline?: boolean
}

const getComponentType = (href?: string): React.ElementType => {
  if (href && isExternalLink(href)) return 'a'
  if (href) return RouterLink
  return 'button'
}

const getLinkProps = (href?: string): Record<string, unknown> => {
  if (href && isExternalLink(href)) return { href }
  if (href) return { to: href }
  return {}
}

export default function HetButtonSecondary(props: HetButtonSecondaryProps) {
  const { children, href, onClick, buttonClassName, ariaLabel } = props

  const ComponentProp = getComponentType(href)
  const linkProps = getLinkProps(href)

  return (
    <Button
      variant='outlined'
      className={`mx-auto my-2 w-auto rounded-2xl bg-white px-8 py-2 shadow-none hover:cursor-pointer hover:border-methodology-green hover:bg-methodology-green hover:shadow-none ${
        buttonClassName ?? ''
      }`}
      onClick={onClick}
      aria-label={ariaLabel}
      component={ComponentProp}
      {...linkProps}
    >
      <span className='font-bold text-alt-green text-small shadow-none hover:text-alt-black hover:shadow-none'>
        {children}
      </span>
    </Button>
  )
}
