import type { MouseEvent } from 'react'

interface HetClearButtonProps {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}

export default function HetClearButton(props: HetClearButtonProps) {
  return (
    <button
      type='button'
      onClick={props.onClick}
      className='cursor-pointer border-0 bg-transparent text-altDark text-smallest hover:underline'
    >
      Clear
    </button>
  )
}
