import { Button } from '@mui/material'
import { type ReactNode } from 'react'

interface HetBigCTAProps {
  children: ReactNode
  href: string
  id?: string
}

export default function HetBigCTA(props: HetBigCTAProps) {
  return (
    <Button
      id={props.id}
      variant='contained'
      className='rounded-2xl px-8 py-5'
      href={props.href}
    >
      <span className='text-exploreButton text-white'>{props.children}</span>
    </Button>
  )
}
