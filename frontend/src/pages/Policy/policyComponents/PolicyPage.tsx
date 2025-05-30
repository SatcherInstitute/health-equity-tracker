import { Outlet, useLocation, useMatch } from 'react-router'
import HetOnThisPageMenu from '../../../styles/HetComponents/HetOnThisPageMenu'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'
import { useResponsiveWidth } from '../../../utils/hooks/useResponsiveWidth'
import { policyRouteConfigs } from '../policyContent/policyRouteConfigs'
import PolicyCardMenu from './PolicyCardMenu'
import PolicyCardMenuMobile from './PolicyCardMenuMobile'
import PolicyPagination from './PolicyPagination'

export default function PolicyPage() {
  const location = useLocation()
  const [ref] = useResponsiveWidth()

  const activeRoute = policyRouteConfigs.find(
    (route) => route.path === location.pathname,
  )

  return (
    <>
      <title>Policy Context - Health Equity Tracker</title>

      <section
        ref={ref}
        className='mx-auto flex w-svw max-w-lgplus justify-center text-left'
        aria-labelledby='page-heading'
      >
        <div className='flex w-svw max-w-lgplus grow flex-col smplus:m-5 smplus:flex-row'>
          <div className='w-fit min-w-fit max-w-screen'>
            <PolicyCardMenu />
            <PolicyCardMenuMobile />
          </div>
          <div className='xs:block flex grow smplus:flex-col'>
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
              {activeRoute?.visible && (
                <h1 className='my-2 font-bold font-sans-title text-alt-green text-big-header leading-normal'>
                  {activeRoute?.label}
                </h1>
              )}

              <Outlet />

              {/* PREV / NEXT */}
              <PolicyPagination />
            </section>
          </div>
          {/* ON THIS PAGE SUB-MENU - DESKTOP */}
          <div className='hidden w-on-this-page-menu-desktop min-w-fit max-w-on-this-page-menu-desktop md:block'>
            {policyRouteConfigs.map((routeConfig) => {
              const match = useMatch({
                path: routeConfig.path,
                end: true,
              })
              const hasSublinks =
                routeConfig.subLinks && routeConfig.subLinks.length > 0
              return match && hasSublinks ? (
                <div
                  className='sticky top-24 z-almost-top hidden h-min w-full min-w-40 max-w-menu flex-col smplus:flex'
                  key={routeConfig.path}
                >
                  <HetOverline className='mt-0' text='On this Page' />
                  <HetOnThisPageMenu
                    links={routeConfig.subLinks}
                    className='sticky top-24 right-0 z-almost-top h-min'
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
