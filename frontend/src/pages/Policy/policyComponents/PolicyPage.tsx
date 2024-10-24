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
        className='flex w-svw justify-center text-left max-w-lgXl mx-auto'
        aria-labelledby='page-heading'
      >
        <div className='smMd:m-5 max-w-lgXl w-svw flex flex-col grow smMd:flex-row'>
          <h2 className='sr-only'>Gun Violence Policy Context Page</h2>

          <div className='min-w-fit w-fit max-w-screen'>
            <PolicyCardMenu />
            <PolicyCardMenuMobile />
          </div>
          <div className='flex grow smMd:flex-col xs:block'>
            {/* ON THIS PAGE SUB-MENU - MOBILE/TABLET */}
            <div className='md:hidden px-8'>
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

            <section className='flex flex-col justify-end mx-8 md:mx-12 my-0'>
              {activeRoute?.visible && isMobileView && (
                <h1 className='font-sansTitle text-bigHeader font-bold my-0 leading-lhNormal'>
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
          <div className='hidden min-w-fit md:block max-w-onThisPageMenuDesktop w-onThisPageMenuDesktop'>
            {policyRouteConfigs.map((routeConfig) => {
              const match = useMatch({
                path: routeConfig.path,
                end: true,
              })
              const hasSublinks =
                routeConfig.subLinks && routeConfig.subLinks.length > 0
              return match && hasSublinks ? (
                <div
                  className='min-w-40 max-w-menu w-full sticky top-24 z-almostTop hidden h-min smMd:flex flex-col'
                  key={routeConfig.path}
                >
                  <HetOverline className='mt-0' text='On this Page' />
                  <h4
                    id='on-this-page-policy-header'
                    className='mt-2 mb-4 font-sansTitle text-title leading-lhNormal mr-16 w-fit'
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
