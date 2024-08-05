import { Helmet } from 'react-helmet-async'
import { Route, Switch, useLocation } from 'react-router-dom'
import { routeConfigs } from '../policyContent/routeConfigs'
import { GUN_VIOLENCE_POLICY } from '../../../utils/internalRoutes'

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
					<h2 className='sr-only'>Policy Page</h2>

					<a href={GUN_VIOLENCE_POLICY}>
						Gun Violence Section
					</a>

					<section className='m-[2%] max-w-lgXl flex flex-col grow smMd:flex-row smMd:gap-2 md:gap-12'>
						<div className='flex flex-wrap grow p-1'>
							<article className='flex w-full flex-col p-8 text-left md:p-0 '>
								<h2 className='font-serif text-header font-light' id='main'>
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
				</div>
			</>
		)
}