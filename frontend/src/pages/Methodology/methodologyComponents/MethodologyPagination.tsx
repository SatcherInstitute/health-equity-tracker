import { useHistory, useLocation } from 'react-router-dom';
import HetPaginationButton from '../../../styles/HetComponents/HetPaginationButton';
import { routeConfigs } from '../methodologyContent/routeConfigs';

export default function MethodologyPagination() {
	const history = useHistory();
	const location = useLocation();

	const currentIndex = routeConfigs.findIndex(
		(route) => route.path === location.pathname,
	);

	const nextRoute = routeConfigs[currentIndex + 1];
	const prevRoute = routeConfigs[currentIndex - 1];

	function goNext() {
		if (nextRoute) {
			history.push(nextRoute.path);
		}
	}

	function goPrevious() {
		if (prevRoute) {
			history.push(prevRoute.path);
		}
	}

	/* When a previous or next step isn't available, render empty div to keep flex alignment working */
	return (
		<div className='mx-0 mb-0 mt-4 flex w-full flex-col justify-between md:mt-8 md:flex-row md:self-stretch '>
			{prevRoute ? (
				<HetPaginationButton direction='previous' onClick={goPrevious}>
					{prevRoute.label}
				</HetPaginationButton>
			) : (
				<div />
			)}

			{nextRoute ? (
				<HetPaginationButton
					direction='next'
					onClick={goNext}
					disabled={currentIndex === routeConfigs.length - 1}
				>
					{nextRoute.label}
				</HetPaginationButton>
			) : (
				<div />
			)}
		</div>
	);
}
