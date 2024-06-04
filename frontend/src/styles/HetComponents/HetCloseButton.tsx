import { Button } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close'

interface HetCloseButtonProps {
	onClick: () => void,
	ariaLabel: string
}

export default function HetCloseButton(props: HetCloseButtonProps) {
	return (
		<Button
			sx={{ float: 'right' }}
			onClick={props.onClick}
			color='primary'
			aria-label={props.ariaLabel}
		>
			<CloseIcon />
		</Button>)
}
