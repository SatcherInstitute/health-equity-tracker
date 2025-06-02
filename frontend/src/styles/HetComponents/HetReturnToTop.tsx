import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import { Button } from '@mui/material'

export default function HetReturnToTop() {
  return (
    <Button
      aria-label='Scroll to Top'
      onClick={() => {
        window.scrollTo(0, 0)
      }}
      className='rounded-xl border-none bg-opacity-0 focus:outline-hidden'
    >
      <ArrowUpwardRoundedIcon />
    </Button>
  )
}
