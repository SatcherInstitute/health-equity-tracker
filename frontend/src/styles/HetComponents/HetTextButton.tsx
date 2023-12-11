import { Button } from '@mui/material'
import { type ReactNode } from 'react'

interface HetTextButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  id?: string
  className?: string
  ariaLabel?: string
}

export default function HetTextButton(props: HetTextButtonProps) {
  return (
    /*    <Button
      id={props.id}
      variant='contained'
      className={`rounded-2xl px-8 py-5 ${props.className ?? ''}`}
      href={props.href}
    >
      <span className='text-exploreButton text-white'>{props.children}</span>
    </Button> */
    <Button
      color='primary'
      href={props.href}
      onClick={props.onClick}
      className='px-6'
      aria-label={props.ariaLabel}
    >
      <span className=' text-alt-green'>{props.children}</span>
    </Button>
  )
}
