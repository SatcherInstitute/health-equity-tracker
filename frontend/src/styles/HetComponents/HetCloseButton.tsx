import CloseIcon from '@mui/icons-material/Close'
import { Button } from '@mui/material'

interface HetCloseButtonProps {
  onClick: () => void
  ariaLabel: string
  className?: string
}

export default function HetCloseButton(props: HetCloseButtonProps) {
  return (
    <Button
      sx={{ float: 'right' }}
      onClick={props.onClick}
      color='primary'
      aria-label={props.ariaLabel}
      className={props.className}
    >
      <CloseIcon />
    </Button>
  )
}
