import { type ReactNode } from 'react'
import { useHistory } from 'react-router-dom'

interface HetBigCTAProps {
  // label: string
  children: ReactNode
  href: string
}

export default function HetBigCTA(props: HetBigCTAProps) {
  const routerHistory = useHistory()

  function handleClick() {
    setTimeout(() => {
      routerHistory.push(props.href)
    }, 200) // Delay of 0.5 seconds (500 milliseconds)
  }

  return (
    <button
      id='cta'
      className='inline  overflow-hidden rounded-2xl border-0 bg-alt-green px-10 py-5 font-sansTitle text-exploreButton font-medium text-white no-underline shadow-raised-tighter hover:cursor-pointer hover:bg-dark-green'
      onClick={() => {
        handleClick()
      }}
    >
      {props.children}
    </button>
  )
}
