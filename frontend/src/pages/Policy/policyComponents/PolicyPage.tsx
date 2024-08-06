import { Helmet } from 'react-helmet-async'
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'
import { routeConfigs } from '../policyContent/routeConfigs'
import { GUN_VIOLENCE_POLICY } from '../../../utils/internalRoutes'
import HetOnThisPageMenu from '../../../styles/HetComponents/HetOnThisPageMenu'

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

				<div className='flex w-full justify-center'>
					<h2 className='sr-only'>Policy Context Page</h2>

					<a href={GUN_VIOLENCE_POLICY}>
						Gun Violence Section
					</a>

					<div className='flex flex-wrap grow p-1'>
						{/* ON THIS PAGE SUB-MENU - MOBILE/TABLET */}
						<div className='px-12 md:hidden'>
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
						</div>
					
					<section className='m-[2%] max-w-lgXl flex flex-col grow smMd:flex-row smMd:gap-2 md:gap-12' id='main'>
						<div className='flex flex-wrap grow p-1'>
							<article className='flex w-full flex-col p-8 text-left md:p-0 '>
								<h2 className='font-serif text-header font-light' >
									{activeRoute?.label}
								</h2>

								<Switch>
									{routeConfigs.map((route) => (
										<Route
											key={route.path}
											exact
											path={route.path}
											component={route.component}
										/>
									))}
								</Switch>
							</article>
						</div>
					</section>
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
			</>
		)
}