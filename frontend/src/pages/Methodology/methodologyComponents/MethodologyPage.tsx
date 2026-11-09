import { Outlet, useLocation, useMatch } from 'react-router'
import HetOnThisPageMenu from '../../../styles/HetComponents/HetOnThisPageMenu'
import { methodologyRouteConfigs } from '../methodologyContent/methodologyRouteConfigs'
import MethodologyCardMenu from './MethodologyCardMenu'
import MethodologyCardMenuMobile from './MethodologyCardMenuMobile'
import MethodologyPagination from './MethodologyPagination'

export default function MethodologyPage() {
  const location = useLocation()

  const activeRoute = methodologyRouteConfigs.find(
    (route) => route.path === location.pathname,
  )

  return (
    <>
      <title>Methodology - Health Equity Tracker</title>

      <section
        className='flex w-full max-w-full justify-center text-left'
        aria-labelledby='page-heading'
        id='main-content'
      >
        <div className='max-w-lgplus smplus:m-5 smplus:flex-row flex min-w-0 grow flex-col'>
          {/* MAIN METHODOLOGY PAGES MENU */}
          <div className='w-fit min-w-fit'>
            <MethodologyCardMenu />
            <MethodologyCardMenuMobile />
          </div>

          {/* CONTENT */}
          <div className='xs:block smplus:flex-col flex grow'>
            {/* ON THIS PAGE SUB-MENU - MOBILE/TABLET */}
            <div className='px-8 lg:hidden'>
              {methodologyRouteConfigs.map((routeConfig) => {
                const match = useMatch({
                  path: routeConfig.path,
                  end: true,
                })
                const hasSublinks =
                  routeConfig.subLinks && routeConfig.subLinks.length > 0
                return match && hasSublinks ? (
                  <div className='mt-2 mb-12' key={routeConfig.path}>
                    <p className='font-roboto text-alt-black text-smallest my-0 text-left font-semibold uppercase'>
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

            <section className='mx-8 my-0 flex grow flex-col justify-end lg:mx-12'>
              {activeRoute?.visible && (
                <h1
                  className='font-sans-title text-alt-green text-big-header my-0 mb-8 leading-normal font-bold'
                  id='page-heading'
                >
                  {activeRoute?.label}
                </h1>
              )}
              <Outlet />
              {/* PREV / NEXT */}
              <MethodologyPagination />
            </section>
          </div>

          {/* ON THIS PAGE SUB-MENU - DESKTOP */}
          <div className='hidden lg:block'>
            {methodologyRouteConfigs.map((routeConfig) => {
              const match = useMatch({
                path: routeConfig.path,
                end: true,
              })
              const hasMatchedSublinks = Boolean(
                match && routeConfig?.subLinks?.length,
              )
              return (
                hasMatchedSublinks && (
                  <div
                    className='z-almost-top max-w-menu sticky top-24 hidden h-min w-48 min-w-40 flex-col lg:flex'
                    key={routeConfig.path}
                  >
                    <p className='font-roboto text-alt-black text-smallest my-0 text-left font-semibold uppercase'>
                      On this page
                    </p>

                    <HetOnThisPageMenu
                      links={routeConfig.subLinks}
                      className=''
                    />
                  </div>
                )
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
