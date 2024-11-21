import { Button } from '@mui/material'
import type { ReactNode } from 'react'

interface HetCTALinkSmallProps {
  children: ReactNode
  href: string
  onClick?: (event: any) => void
  id?: string
  className?: string
}

export default function HetCTALinkSmall({
  children,
  href,
  id,
  onClick,
  className,
}: HetCTALinkSmallProps) {
  return (
    <Button
      id={id}
      variant='outlined'
      className={`rounded-2xl my-2 px-8 py-2 w-auto bg-altGreen ${className ?? ''}`}
      href={href}
      onClick={onClick}
    >
      <span className='text-small text-white font-bold'>{children}</span>
    </Button>
  )
}
