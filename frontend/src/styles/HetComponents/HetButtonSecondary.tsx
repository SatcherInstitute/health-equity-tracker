import { Button } from '@mui/material'
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'

interface HetButtonSecondaryProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  buttonClassName?: string
  ariaLabel?: string
  underline?: boolean
}

const isExternalLink = (href?: string): boolean => {
  return (
    !!href &&
    (href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:'))
  )
}

const getComponentType = (href?: string): React.ElementType => {
  if (isExternalLink(href)) {
    return 'a'
  }
  if (href) {
    return RouterLink
  }
  return 'button'
}

const getLinkProps = (href?: string): Record<string, unknown> => {
  if (isExternalLink(href)) {
    return { href }
  }
  if (href) {
    return { to: href }
  }
  return {}
}

export default function HetButtonSecondary(props: HetButtonSecondaryProps) {
  const { children, href, onClick, buttonClassName, ariaLabel } = props

  const ComponentProp = getComponentType(href)
  const linkProps = getLinkProps(href)

  return (
    <Button
      variant='outlined'
      className={`shadow-none hover:shadow-none hover:cursor-pointer hover:border-methodologyGreen rounded-2xl my-2 mx-auto px-8 py-2 w-auto bg-white hover:bg-methodologyGreen ${
        buttonClassName ?? ''
      }`}
      onClick={onClick}
      aria-label={ariaLabel}
      component={ComponentProp}
      {...linkProps}
    >
      <span className='text-small text-altGreen hover:text-altBlack font-bold shadow-none hover:shadow-none'>
        {children}
      </span>
    </Button>
  )
}
