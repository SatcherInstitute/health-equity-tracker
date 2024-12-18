import { Helmet } from 'react-helmet-async'
import { policyRouteConfigs } from '../policyContent/policyRouteConfigs'
import HetOnThisPageMenu from '../../../styles/HetComponents/HetOnThisPageMenu'
import PolicyPagination from './PolicyPagination'
import PolicyCardMenuMobile from './PolicyCardMenuMobile'
import PolicyCardMenu from './PolicyCardMenu'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'
import { useMatch, useLocation, Outlet } from 'react-router-dom'
import { useResponsiveWidth } from '../../../utils/hooks/useResponsiveWidth'

export default function PolicyPage() {
  const location = useLocation()
  const [ref, width] = useResponsiveWidth()
  const isMobileView = width < 960

  const activeRoute = policyRouteConfigs.find(
    (route) => route.path === location.pathname,
  )

  return (
    <>
      <Helmet>
        <title>Policy Context - Health Equity Tracker</title>
      </Helmet>

      <h1 className='sr-only' id='page-heading'>
        {activeRoute?.label}
      </h1>

      <section
        ref={ref}
        className='mx-auto flex w-svw max-w-lgXl justify-center text-left'
        aria-labelledby='page-heading'
      >
        <div className='flex w-svw max-w-lgXl grow flex-col smMd:m-5 smMd:flex-row'>
          <h2 className='sr-only'>Gun Violence Policy Context Page</h2>

          <div className='w-fit min-w-fit max-w-screen'>
            <PolicyCardMenu />
            <PolicyCardMenuMobile />
          </div>
          <div className='xs:block flex grow smMd:flex-col'>
            {/* ON THIS PAGE SUB-MENU - MOBILE/TABLET */}
            <div className='px-8 md:hidden'>
              {policyRouteConfigs.map((routeConfig) => {
                const match = useMatch({
                  path: routeConfig.path,
                  end: true,
                })
                const hasSublinks =
                  routeConfig.subLinks && routeConfig.subLinks.length > 0
                return match && hasSublinks ? (
                  <div className='mt-2 mb-12' key={routeConfig.path}>
                    <HetOverline className='mt-0' text='On this Page' />
                    <HetOnThisPageMenu links={routeConfig.subLinks} />
                  </div>
                ) : null
              })}
            </div>

            <section className='mx-8 my-0 flex flex-col justify-end md:mx-12'>
              {activeRoute?.visible && isMobileView && (
                <h1 className='my-0 font-bold font-sansTitle text-bigHeader leading-lhNormal'>
                  {activeRoute?.label}
                </h1>
              )}
              <h2 className='sr-only'>{activeRoute?.label}</h2>

              <Outlet />

              {/* PREV / NEXT */}
              <PolicyPagination />
            </section>
          </div>
          {/* ON THIS PAGE SUB-MENU - DESKTOP */}
          <div className='hidden w-onThisPageMenuDesktop min-w-fit max-w-onThisPageMenuDesktop md:block'>
            {policyRouteConfigs.map((routeConfig) => {
              const match = useMatch({
                path: routeConfig.path,
                end: true,
              })
              const hasSublinks =
                routeConfig.subLinks && routeConfig.subLinks.length > 0
              return match && hasSublinks ? (
                <div
                  className='sticky top-24 z-almostTop hidden h-min w-full min-w-40 max-w-menu flex-col smMd:flex'
                  key={routeConfig.path}
                >
                  <HetOverline className='mt-0' text='On this Page' />
                  <h4
                    id='on-this-page-policy-header'
                    className='mt-2 mr-16 mb-4 w-fit font-sansTitle text-title leading-lhNormal'
                  >
                    {routeConfig.label}
                  </h4>

                  <HetOnThisPageMenu
                    links={routeConfig.subLinks}
                    className='sticky top-24 right-0 z-almostTop h-min'
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
