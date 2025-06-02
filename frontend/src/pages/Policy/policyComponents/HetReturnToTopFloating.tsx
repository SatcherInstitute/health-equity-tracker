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
      className={`fixed right-4 bottom-8 z-top transform rounded-xl bg-hover-alt-green py-4 text-black shadow-sm transition-transform hover:scale-110 hover:shadow-raised md:right-36 ${props.className}`}
    >
      <ArrowUpwardRoundedIcon />
    </Button>
  )
}
