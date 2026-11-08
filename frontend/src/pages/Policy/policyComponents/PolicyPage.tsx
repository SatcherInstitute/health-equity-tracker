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
        className='max-w-lgplus mx-auto flex w-svw justify-center text-left'
        aria-labelledby='page-heading'
      >
        <div className='max-w-lgplus smplus:m-5 smplus:flex-row flex w-svw grow flex-col'>
          <div className='w-fit max-w-screen min-w-fit'>
            <PolicyCardMenu />
            <PolicyCardMenuMobile />
          </div>
          <div className='xs:block smplus:flex-col flex grow'>
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
                <h1 className='font-sans-title text-alt-green text-big-header my-2 leading-normal font-bold'>
                  {activeRoute?.label}
                </h1>
              )}

              <Outlet />

              {/* PREV / NEXT */}
              <PolicyPagination />
            </section>
          </div>
          {/* ON THIS PAGE SUB-MENU - DESKTOP */}
          <div className='w-on-this-page-menu-desktop max-w-on-this-page-menu-desktop hidden min-w-fit md:block'>
            {policyRouteConfigs.map((routeConfig) => {
              const match = useMatch({
                path: routeConfig.path,
                end: true,
              })
              const hasSublinks =
                routeConfig.subLinks && routeConfig.subLinks.length > 0
              return match && hasSublinks ? (
                <div
                  className='z-almost-top max-w-menu smplus:flex sticky top-24 hidden h-min w-full min-w-40 flex-col'
                  key={routeConfig.path}
                >
                  <HetOverline className='mt-0' text='On this Page' />
                  <HetOnThisPageMenu
                    links={routeConfig.subLinks}
                    className='z-almost-top sticky top-24 right-0 h-min'
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
