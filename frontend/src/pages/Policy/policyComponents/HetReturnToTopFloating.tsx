import { Button } from '@mui/material'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'

interface HetReturnToTopFloatingProps {
  id?: string
  className?: string
}

export default function HetReturnToTopFloating(props: HetReturnToTopFloatingProps) {
  return (
			<Button
				aria-label='Return to Top'
				onClick={() => {
					window.scrollTo(0, 0)
				}}
				className={`fixed py-4 bottom-8 right-4 md:right-36 z-top rounded-xl bg-hoverAltGreen text-black shadow-sm hover:shadow-raised transition-transform transform hover:scale-110 ${props.className}`}
			>
				<ArrowUpwardRoundedIcon />
			</Button>
		)
}