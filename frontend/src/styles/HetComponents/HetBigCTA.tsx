import { Button } from '@mui/material'
import { type ReactNode } from 'react'
import { useHistory } from 'react-router-dom'


interface HetBigCTAProps {
  children: ReactNode
  href: string
  id?: string
  className?: string
}

export default function HetBigCTA(props: HetBigCTAProps) {

  const history = useHistory();

  let handleClick = () => {
    history.push(props.href)
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
      className={`rounded-2xl px-8 py-5 ${props.className ?? ''}`}
      href={optionalMailTo}
      onClick={handleClick}
    >
      <span className='text-exploreButton text-white'>{props.children}</span>
    </Button>
  )
}
