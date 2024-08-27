import { Button } from '@mui/material'
import type { ReactNode } from 'react'
import { useHistory } from 'react-router-dom'

interface HetCTASmallProps {
	children: ReactNode
	href: string
	id?: string
	className?: string
}

export default function HetCTASmall(props: HetCTASmallProps) {
	const history = useHistory()

	let handleClick = () => {
		history.push(props.href)
	}
	let optionalMailTo = undefined
	if (props.href.startsWith('mailto:')) {
		handleClick = () => null
		optionalMailTo = props.href
	}

	return (
		<Button
			id={props.id}
			variant='outlined'
			className={`rounded-2xl my-2 px-8 py-2 w-auto bg-altGreen ${
				props.className ?? ''
			}`}
			href={optionalMailTo}
			onClick={handleClick}
		>
			<span className='text-small text-white font-bold'>
				{props.children}
			</span>
		</Button>
	)
}
