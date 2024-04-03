import { Button } from '@mui/material'
import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'


interface HetBigCTAProps {
  children: ReactNode
  href: string
  id?: string
  className?: string
}

export default function HetBigCTA(props: HetBigCTAProps) {

  const navigateTo = useNavigate();

  return (
    <Button
      id={props.id}
      variant='contained'
      className={`rounded-2xl px-8 py-5 ${props.className ?? ''}`}
      onClick={() => {
        navigateTo(props.href)
      }}
    >
      <span className='text-exploreButton text-white'>{props.children}</span>
    </Button>
  )
}
