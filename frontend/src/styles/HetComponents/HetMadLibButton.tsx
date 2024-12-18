import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
import { Button } from '@mui/material'
import type { MouseEvent, ReactNode } from 'react'

interface HetMadLibButtonProps {
  children: ReactNode
  handleClick: (event: MouseEvent<HTMLButtonElement>) => void
  isOpen: boolean
  className?: string
}

export default function HetMadLibButton(props: HetMadLibButtonProps) {
  return (
    <Button
      variant='text'
      aria-haspopup='true'
      className={`mx-4 my-1 min-w-[100px] border border-altGreen border-solid py-0 pr-1 pl-3 font-medium text-altGreen text-title shadow-raised-tighter sm:text-smallestHeader lg:text-smallerHeader ${
        props.className ?? ''
      } `}
      onClick={props.handleClick}
    >
      <span>
        {props.children}
        <span className='mx-1'>
          {props.isOpen ? <ArrowDropUp /> : <ArrowDropDown />}
        </span>
      </span>
    </Button>
  )
}
