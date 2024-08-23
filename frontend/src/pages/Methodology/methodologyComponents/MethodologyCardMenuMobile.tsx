import Toolbar from '@mui/material/Toolbar';
import { Select, FormControl, MenuItem, InputLabel } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { routeConfigs } from '../methodologyContent/routeConfigs';

interface MethodologyCardMenuMobileProps {
	className?: string;
}

export default function MethodologyCardMenuMobile(
	props: MethodologyCardMenuMobileProps,
) {
	const history = useHistory();

	const handleSelected = (event: any) => {
		history.push(event.target.value);
	};

	return (
		<>
			<div
				className={`top-0 z-almostTop flex items-center rounded-sm bg-white pt-8 pb-4 px-0 sm:items-start sm:justify-start md:justify-center w-fit max-w-screen ${
					props.className ?? ''
				}`}
			>
				<Toolbar className='w-auto max-w-screen'>
					<FormControl sx={{ minWidth: '90vw' }} size='medium'>
						<InputLabel id='methodology-select-label'>
							Methodology Pages
						</InputLabel>
						<Select
							labelId='methodology-select-label'
							value={window.location.pathname}
							onChange={handleSelected}
							label='Methodology Pages'
						>
							{routeConfigs.map((config) => (
								<MenuItem key={config.path} value={config.path}>
									{config.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Toolbar>
			</div>
		</>
	);
}
