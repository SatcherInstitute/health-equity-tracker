import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Link, Route, Switch } from 'react-router-dom';
import {
	OLD_AGE_ADJUSTMENT_LINK,
	OLD_METHODOLOGY_PAGE_LINK,
} from '../../utils/internalRoutes';

import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp';
import OldAgeAdjustmentTab from './OldAgeAdjustmentTab';
// can't lazy load (yet) due to loading issues
import OldMethodologyTab from './OldMethodologyTab';

export default function OldMethodologyPage() {
	const isSm = useIsBreakpointAndUp('sm');

	return (
		<div className='mx-auto min-h-screen max-w-lg'>
			<Route path='/'>
				<Tabs
					centered={isSm}
					indicatorColor='primary'
					textColor='primary'
					value={window.location.pathname}
					variant={isSm ? 'standard' : 'fullWidth'}
					scrollButtons={isSm ? 'auto' : undefined}
				>
					<Tab
						value={OLD_METHODOLOGY_PAGE_LINK}
						label='Methodology'
						component={Link}
						to={OLD_METHODOLOGY_PAGE_LINK}
					/>
					<Tab
						value={OLD_AGE_ADJUSTMENT_LINK}
						label='Age-Adjustment'
						component={Link}
						to={OLD_AGE_ADJUSTMENT_LINK}
					/>
				</Tabs>
			</Route>

			<Switch>
				<Route path={`${OLD_METHODOLOGY_PAGE_LINK as string}/`}>
					<OldMethodologyTab />
				</Route>

				<Route path={`${OLD_AGE_ADJUSTMENT_LINK as string}/`}>
					<OldAgeAdjustmentTab />
				</Route>
			</Switch>
		</div>
	);
}
