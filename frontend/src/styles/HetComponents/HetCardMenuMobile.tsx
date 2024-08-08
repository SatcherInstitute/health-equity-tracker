import Toolbar from '@mui/material/Toolbar';
import { Select, FormControl, MenuItem, InputLabel } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { routeConfigs } from '../../pages/Policy/policyContent/routeConfigs';

interface HetCardMenuMobileProps {
	className?: string;
}

export default function HetCardMenuMobile(
	props: HetCardMenuMobileProps,
) {
	const history = useHistory();

	const handleSelected = (event: any) => {
		history.push(event.target.value);
	};

	return (
		<>
			<div
				className={`top-0 z-almostTop flex items-center rounded-sm bg-white p-1 sm:items-start sm:justify-start md:justify-center ${
					props.className ?? ''
				}`}
			>
				<Toolbar className='w-full'>
					<FormControl sx={{ minWidth: '90vw' }} size='medium'>
						<InputLabel id='context-select-label'>
							Policy Context Pages
						</InputLabel>
						<Select
							labelId='context-select-label'
							value={window.location.pathname}
							onChange={handleSelected}
							label='Policy Context Pages'
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
