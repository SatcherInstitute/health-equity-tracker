import { Button } from '@mui/material'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface HetCTASmallProps {
  children?: ReactNode
  href: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  id?: string
  className?: string
}

export default function HetCTASmall({
  children,
  href,
  id,
  className,
  onClick,
}: HetCTASmallProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick({} as React.MouseEvent<HTMLAnchorElement, MouseEvent>)
    }
    if (!href.startsWith('mailto:')) {
      navigate(href)
    }
  }

  const isMailTo = href.startsWith('mailto:')
  const optionalMailTo = isMailTo ? href : undefined

  return (
    <Button
      id={id}
      variant='outlined'
      className={`rounded-2xl my-2 px-8 py-2 w-auto bg-altGreen hover:bg-darkGreen ${className ?? ''}`}
      href={optionalMailTo}
      onClick={handleClick}
    >
      <span className='text-small text-white font-bold'>{children}</span>
    </Button>
  )
}
