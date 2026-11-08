import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import { Button } from '@mui/material'

interface HetReturnToTopFloatingProps {
  id?: string
  className?: string
}

export default function HetReturnToTopFloating(
  props: HetReturnToTopFloatingProps,
) {
  return (
    <Button
      aria-label='Return to Top'
      onClick={() => {
        window.scrollTo(0, 0)
      }}
      className={`z-top bg-hover-alt-green text-alt-black hover:shadow-raised fixed right-4 bottom-8 transform rounded-xl py-4 shadow-sm transition-transform hover:scale-110 md:right-36 ${props.className}`}
    >
      <ArrowUpwardRoundedIcon />
    </Button>
  )
}
