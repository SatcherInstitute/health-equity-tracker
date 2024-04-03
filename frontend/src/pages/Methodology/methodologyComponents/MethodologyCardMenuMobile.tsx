import Toolbar from '@mui/material/Toolbar';
import { Select, FormControl, MenuItem, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { routeConfigs } from '../methodologyContent/routeConfigs';

interface MethodologyCardMenuMobileProps {
	className?: string;
}

export default function MethodologyCardMenuMobile(
	props: MethodologyCardMenuMobileProps,
) {
	const navigateTo = useNavigate();

	const handleSelected = (event: any) => {
		navigateTo(event.target.value);
	};

	return (
		<>
			<div
				className={`top-0 z-almostTop flex items-center rounded-sm bg-white p-1 sm:items-start sm:justify-start md:justify-center ${props.className ?? ''
					}`}
			>
				<Toolbar className='w-full'>
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
