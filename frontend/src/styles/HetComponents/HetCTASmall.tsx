import { Button } from '@mui/material'
import type { ReactNode } from 'react'

interface HetCTASmallProps {
  children: ReactNode
  href: string
  onClick?: (event: any) => void
  id?: string
  className?: string
}

export default function HetCTASmall({
  children,
  href,
  id,
  onClick,
  className,
}: HetCTASmallProps) {
  return (
    <Button
      id={id}
      variant='outlined'
      className={`bg-alt-green my-2 w-auto rounded-2xl px-8 py-2 ${className ?? ''}`}
      href={href}
      onClick={onClick}
    >
      <span className='text-alt-white text-small font-bold'>{children}</span>
    </Button>
  )
}
