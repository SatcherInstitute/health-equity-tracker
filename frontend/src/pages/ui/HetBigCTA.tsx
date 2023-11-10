import { type ReactNode } from 'react'
import { useHistory } from 'react-router-dom'

interface HetBigCTAProps {
  children: ReactNode
  href: string
}

export default function HetBigCTA(props: HetBigCTAProps) {
  const routerHistory = useHistory()

  function handleClick() {
    setTimeout(() => {
      routerHistory.push(props.href)
    }, 200)
  }

  return (
    <button
      id='cta'
      className='relative overflow-hidden rounded-2xl  border-0 bg-alt-green px-10 py-5 shadow-raised-tighter hover:cursor-pointer hover:bg-dark-green focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-1  focus-visible:outline-bar-chart-light active:bg-clicked'
      onClick={() => {
        handleClick()
      }}
    >
      <span className='font-sansTitle text-exploreButton  font-medium text-white no-underline'>
        {props.children}
      </span>
    </button>
  )
}
