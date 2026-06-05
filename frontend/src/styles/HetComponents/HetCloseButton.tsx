import CloseIcon from '@mui/icons-material/Close'
import { IconButton } from '@mui/material'

interface HetCloseButtonProps {
  onClick: () => void
  ariaLabel: string
  className?: string
}

export default function HetCloseButton(props: HetCloseButtonProps) {
  return (
    <IconButton
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      className={props.className}
    >
      <CloseIcon />
    </IconButton>
  )
}
