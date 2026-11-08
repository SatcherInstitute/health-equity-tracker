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
  let optionalMailTo
  if (props.href.startsWith('mailto:')) {
    handleClick = () => null
    optionalMailTo = props.href
  }

  return (
    <Button
      id={props.id}
      variant='contained'
      className={`xs:my-4 m-0 my-8 max-w-3/5 rounded-2xl px-6 py-4 sm:w-auto sm:px-16 ${
        props.className ?? ''
      }`}
      href={optionalMailTo}
      onClick={handleClick}
    >
      <span className='text-alt-white text-explore-button xs:text-small sm:text-small font-bold'>
        {props.children}
      </span>
    </Button>
  )
}
