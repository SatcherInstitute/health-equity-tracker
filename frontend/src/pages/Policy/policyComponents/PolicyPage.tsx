import { Helmet } from 'react-helmet-async'
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'
import { routeConfigs } from '../policyContent/routeConfigs'
import HetOnThisPageMenu from '../../../styles/HetComponents/HetOnThisPageMenu'
import HetCardMenu from '../../../styles/HetComponents/HetCardMenu'
import HetCardMenuMobile from '../../../styles/HetComponents/HetCardMenuMobile'
import PolicyPagination from './PolicyPagination'

export default function PolicyPage() {
	const location = useLocation()

	const activeRoute = routeConfigs.find(
		(route) => route.path === location.pathname,
	)

	return (
		<>
			<Helmet>
				<title>Policy Context - Health Equity Tracker</title>
			</Helmet>
			<section className='flex w-full justify-center text-left' id='main'>
				<div className='m-[2%] max-w-lgXl flex flex-col grow smMd:flex-row'>
					<h2 className='sr-only'>Gun Violence Policy Context Page</h2>

					<div className='min-w-fit'>
						<HetCardMenu className='sticky top-4 z-top hidden h-min max-w-menu smMd:block' />
						<HetCardMenuMobile className='m-3 smMd:hidden w-auto' />
					</div>
					
						{/* ON THIS PAGE SUB-MENU - MOBILE/TABLET */}
						<div className='flex grow px-12 smMd:hidden'>
							{routeConfigs.map((routeConfig) => {
								const match = useRouteMatch({
									path: routeConfig.path,
									exact: true,
								})
								const hasSublinks =
									routeConfig.subLinks && routeConfig.subLinks.length > 0
								return match && hasSublinks ? (
									<HetOnThisPageMenu
										key={routeConfig.path}
										links={routeConfig.subLinks}
										className=''
									/>
								) : null
							})}
						</div>
					

					<section className='flex flex-col justify-end grow mx-12 my-0'>
						<h1 className='sr-only'>{activeRoute?.label}</h1>

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
								<PolicyPagination />
							</>
						</Switch>
					</section>

					{/* ON THIS PAGE SUB-MENU - DESKTOP */}
					<div className='hidden min-w-fit md:block'>
						{routeConfigs.map((routeConfig) => {
							const match = useRouteMatch({
								path: routeConfig.path,
								exact: true,
							})
							const hasSublinks =
								routeConfig.subLinks && routeConfig.subLinks.length > 0
							return match && hasSublinks ? (
								<HetOnThisPageMenu
									key={routeConfig.path}
									links={routeConfig.subLinks}
									className='sticky right-0 top-4 z-top h-min'
								/>
							) : null
						})}
					</div>
				</div>
			</section>
		</>
	)
}