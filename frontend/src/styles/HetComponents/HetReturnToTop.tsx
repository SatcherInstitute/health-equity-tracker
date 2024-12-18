import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import { Button } from '@mui/material'

interface HetReturnToTopProps {
  id?: string
  className?: string
}

export default function HetReturnToTop(props: HetReturnToTopProps) {
  return (
    <Button
      aria-label='Scroll to Top'
      onClick={() => {
        window.scrollTo(0, 0)
      }}
      className='rounded-xl border-none bg-opacity-0 focus:outline-none'
    >
      <ArrowUpwardRoundedIcon />
    </Button>
  )
}
