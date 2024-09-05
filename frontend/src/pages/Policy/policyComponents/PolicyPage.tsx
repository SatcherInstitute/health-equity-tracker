import { Helmet } from 'react-helmet-async'
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'
import { routeConfigs } from '../policyContent/routeConfigs'
import HetOnThisPageMenu from '../../../styles/HetComponents/HetOnThisPageMenu'
import PolicyPagination from './PolicyPagination'
import PolicyCardMenuMobile from './PolicyCardMenuMobile'
import PolicyCardMenu from './PolicyCardMenu'

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
      {activeRoute?.visible && (
        <h1 className='sr-only' id='page-heading'>
          {activeRoute?.label}
        </h1>
      )}
      <section
        className='flex w-full justify-center text-left max-w-screen'
        aria-labelledby='page-heading'
      >
        <div className='smMd:m-5 max-w-lgXl flex flex-col grow smMd:flex-row'>
          <h2 className='sr-only'>Gun Violence Policy Context Page</h2>

          <div className='min-w-fit w-fit max-w-screen'>
            <PolicyCardMenu />
            <PolicyCardMenuMobile />
          </div>
          <div className='flex grow smMd:flex-col xs:block'>
            {/* ON THIS PAGE SUB-MENU - MOBILE/TABLET */}
            <div className='md:hidden px-8'>
              {routeConfigs.map((routeConfig) => {
                const match = useRouteMatch({
                  path: routeConfig.path,
                  exact: true,
                })
                const hasSublinks =
                  routeConfig.subLinks && routeConfig.subLinks.length > 0
                return match && hasSublinks ? (
                  <div className='mt-2 mb-12' key={routeConfig.path}>
                    <p className='my-0 text-left font-roboto text-smallest font-semibold uppercase text-black'>
                      On this page
                    </p>
                    <HetOnThisPageMenu
                      links={routeConfig.subLinks}
                      className=''
                    />
                  </div>
                ) : null
              })}
            </div>

            <section className='flex flex-col justify-end grow mx-8 lg:mx-12 my-0'>
              {activeRoute?.visible && (
                <h1 className='font-sansTitle text-bigHeader font-bold my-0 leading-lhNormal'>
                  {activeRoute?.label}
                </h1>
              )}
              <h2 className='sr-only'>{activeRoute?.label}</h2>
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
          </div>
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
                <div
                  className='min-w-40 w-48 max-w-40 sticky top-24 z-almostTop hidden h-min max-w-menu smMd:block flex flex-col'
                  key={routeConfig.path}
                >
                  <p className='my-0 text-left font-roboto text-smallest font-semibold uppercase text-black'>
                    On this page
                  </p>
                  <h4
                    id='on-this-page-policy-header'
                    className='mt-2 mb-4 font-sansTitle text-smallestHeader leading-lhNormal'
                  >
                    {routeConfig.label}
                  </h4>

                  <HetOnThisPageMenu
                    links={routeConfig.subLinks}
                    className='sticky right-0 top-24 z-almostTop h-min'
                  />
                </div>
              ) : null
            })}
          </div>
        </div>
      </section>
    </>
  )
}
