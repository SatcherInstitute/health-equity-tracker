import { HET_URL } from '../../../utils/internalRoutes';
import { Helmet } from 'react-helmet-async';
import { currentYear } from '../../../cards/ui/SourcesHelpers';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import MethodologyCardMenu from './MethodologyCardMenu';
import { routeConfigs } from '.././methodologyContent/routeConfigs';
import MethodologyPagination from './MethodologyPagination';
import MethodologyCardMenuMobile from './MethodologyCardMenuMobile';
import HetOnThisPageMenu from '../../../styles/HetComponents/HetOnThisPageMenu';
export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`;

export default function MethodologyPage() {
	const location = useLocation();

	const activeRoute = routeConfigs.find(
		(route) => route.path === location.pathname,
	);

	return (
		<>
			<Helmet>
				<title>Methodology - Health Equity Tracker</title>
			</Helmet>
			<section
				className='flex w-full justify-center text-left max-w-screen'
				id='main'
			>
			<div className='smMd:m-[2%] max-w-lgXl flex flex-col grow smMd:flex-row'>
				<h2 className='sr-only'>Methodology</h2>

			
					{/* MAIN METHODOLOGY PAGES MENU */}
					<div className='min-w-fit w-fit max-w-screen'>
						<MethodologyCardMenu className='sticky top-24 z-top hidden h-min max-w-menu smMd:block' />
						<MethodologyCardMenuMobile className='p-3 smMd:hidden max-w-screen min-w-full w-screen mx-auto my-0 px-4 flex justify-center'/>
					</div>

					{/* CONTENT */}
					<div className='flex grow smMd:flex-col xs:block'>
						{/* ON THIS PAGE SUB-MENU - MOBILE/TABLET */}
						<div className='md:hidden px-8'>
							{routeConfigs.map((routeConfig) => {
								const match = useRouteMatch({
									path: routeConfig.path,
									exact: true,
								});
								const hasSublinks =
									routeConfig.subLinks && routeConfig.subLinks.length > 0;
								return match && hasSublinks ? (
									<HetOnThisPageMenu
										key={routeConfig.path}
										links={routeConfig.subLinks}
									/>
								) : null;
							})}
						</div>

						<article className='flex w-full flex-col p-8 text-left md:p-0 '>
							{/* HEADING */}
							<h2 className='font-serif text-header font-light' id='main'>
								{activeRoute?.label}
							</h2>

							<Switch>
								<>
									{/* TEXT */}
									{routeConfigs.map((route) => (
										<Route
											key={route.path}
											exact
											path={route.path}
											component={route.component}
										/>
									))}
									{/* PREV / NEXT */}
									<MethodologyPagination />
								</>
							</Switch>
						</article>
					</div>

					{/* ON THIS PAGE SUB-MENU - DESKTOP */}
					<div className='hidden min-w-fit md:block'>
						{routeConfigs.map((routeConfig) => {
							const match = useRouteMatch({
								path: routeConfig.path,
								exact: true,
							});
							const hasSublinks =
								routeConfig.subLinks && routeConfig.subLinks.length > 0;
							return match && hasSublinks ? (
								<HetOnThisPageMenu
									key={routeConfig.path}
									links={routeConfig.subLinks}
									className='sticky right-0 top-4  z-top h-min'
								/>
							) : null;
						})}
					</div>
			
			</div>
			</section>
		</>
	);
}
