import { Helmet } from 'react-helmet-async'
import { Outlet, useLocation, useMatch } from 'react-router-dom'
import HetOnThisPageMenu from '../../../styles/HetComponents/HetOnThisPageMenu'
import methodologyRouteConfigs from '../methodologyContent/methodologyRouteConfigs'
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
      <Helmet>
        <title>Methodology - Health Equity Tracker</title>
      </Helmet>

      <section
        className='flex w-full max-w-screen justify-center text-left'
        aria-labelledby='page-heading'
        id='main-content'
      >
        <div className='flex max-w-lgXl grow flex-col smMd:m-5 smMd:flex-row'>
          {/* MAIN METHODOLOGY PAGES MENU */}
          <div className='w-fit min-w-fit max-w-screen'>
            <MethodologyCardMenu />
            <MethodologyCardMenuMobile />
          </div>

          {/* CONTENT */}
          <div className='xs:block flex grow smMd:flex-col'>
            {/* ON THIS PAGE SUB-MENU - MOBILE/TABLET */}
            <div className='px-8 md:hidden'>
              {methodologyRouteConfigs.map((routeConfig) => {
                const match = useMatch({
                  path: routeConfig.path,
                  end: true,
                })
                const hasSublinks =
                  routeConfig.subLinks && routeConfig.subLinks.length > 0
                return match && hasSublinks ? (
                  <div className='mt-2 mb-12' key={routeConfig.path}>
                    <p className='my-0 text-left font-roboto font-semibold text-black text-smallest uppercase'>
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
                  className='my-0 mb-8 font-bold font-sansTitle text-bigHeader leading-lhNormal'
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
          <div className='hidden min-w-fit md:block'>
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
                    className='sticky top-24 z-almostTop hidden h-min w-48 min-w-40 max-w-40 max-w-menu flex-col smMd:flex'
                    key={routeConfig.path}
                  >
                    <p className='my-0 text-left font-roboto font-semibold text-black text-smallest uppercase'>
                      On this page
                    </p>

                    <HetOnThisPageMenu
                      links={routeConfig.subLinks}
                      className='sticky top-24 right-0 z-almostTop h-min'
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
