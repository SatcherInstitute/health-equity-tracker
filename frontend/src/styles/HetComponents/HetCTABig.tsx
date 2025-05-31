import { Button } from '@mui/material'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

interface HetCTABigProps {
  children: ReactNode
  href: string
  id?: string
  className?: string
}

export default function HetCTABig(props: HetCTABigProps) {
  const navigate = useNavigate()

  let handleClick = () => {
    navigate(props.href)
  }
  let optionalMailTo = undefined
  if (props.href.startsWith('mailto:')) {
    handleClick = () => null
    optionalMailTo = props.href
  }

  return (
    <Button
      id={props.id}
      variant='contained'
      className={`my-8 xs:my-4 w-auto max-w-3/5 rounded-2xl px-24 xs:px-16 py-3 xs:py-4 sm:px-16 ${
        props.className ?? ''
      }`}
      href={optionalMailTo}
      onClick={handleClick}
    >
      <span className='font-bold text-explore-button text-white xs:text-small sm:text-small'>
        {props.children}
      </span>
    </Button>
  )
}
