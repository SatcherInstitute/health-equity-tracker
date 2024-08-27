import { Button } from '@mui/material'
import type { ReactNode } from 'react'
import { useHistory } from 'react-router-dom'

interface HetCTASmallProps {
  children: ReactNode
  href: string
  id?: string
  className?: string
}

export default function HetCTASmall({ children, href, id, className }: HetCTASmallProps) {
  const history = useHistory()

  const handleClick = () => {
    if (!href.startsWith('mailto:')) {
      history.push(href)
    }
  }

  const isMailTo = href.startsWith('mailto:')
  const optionalMailTo = isMailTo ? href : undefined

  return (
    <Button
      id={id}
      variant='outlined'
      className={`rounded-2xl my-2 px-8 py-2 w-auto bg-altGreen ${className ?? ''}`}
      href={optionalMailTo}
      onClick={isMailTo ? undefined : handleClick}
    >
      <span className='text-small text-white font-bold'>
        {children}
      </span>
    </Button>
  )
}