import { HET_URL } from '../../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import { currentYear } from '../../../cards/ui/SourcesHelpers'
import MethodologyCardMenu from './MethodologyCardMenu'
import { routeConfigs } from '.././methodologyContent/routeConfigs'
import MethodologyPagination from './MethodologyPagination'
import MethodologyCardMenuMobile from './MethodologyCardMenuMobile'
import HetOnThisPageMenu from '../../../styles/HetComponents/HetOnThisPageMenu'
export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`
import { Outlet, Route, Routes, useLocation, useMatch } from 'react-router-dom'

export default function MethodologyPage() {
  const location = useLocation()

  const activeRoute = routeConfigs.find(
    (route) => route.path === location.pathname,
  )

  return (
    <>
      <Helmet>
        <title>Methodology - Health Equity Tracker</title>
      </Helmet>
      {activeRoute?.visible && (
        <h1 className='sr-only' id='page-heading'>
          {activeRoute?.label}
        </h1>
      )}
      <section
        className='flex w-full justify-center text-left max-w-screen'
        aria-labelledby='page-heading'
        id='main-content'
      >
        <div className='smMd:m-5 max-w-lgXl flex flex-col grow smMd:flex-row'>
          {/* MAIN METHODOLOGY PAGES MENU */}
          <div className='min-w-fit w-fit max-w-screen'>
            <MethodologyCardMenu />
            <MethodologyCardMenuMobile />
          </div>

          {/* CONTENT */}
          <div className='flex grow smMd:flex-col xs:block'>
            {/* ON THIS PAGE SUB-MENU - MOBILE/TABLET */}
            <div className='md:hidden px-8'>
              {routeConfigs.map((routeConfig) => {
                const match = useMatch({
                  path: routeConfig.path,
                  end: true,
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
                <h1 className='font-sansTitle text-bigHeader font-bold my-0 leading-lhNormal mb-8'>
                  {activeRoute?.label}
                </h1>
              )}
              <h2 className='sr-only'>{activeRoute?.label}</h2>
              <Outlet />
              {/* PREV / NEXT */}
              <MethodologyPagination />
            </section>
          </div>

          {/* ON THIS PAGE SUB-MENU - DESKTOP */}
          <div className='hidden min-w-fit md:block'>
            {routeConfigs.map((routeConfig) => {
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
                    className='min-w-40 w-48 max-w-40 sticky top-24 z-almostTop hidden h-min max-w-menu smMd:flex flex-col'
                    key={routeConfig.path}
                  >
                    <p className='my-0 text-left font-roboto text-smallest font-semibold uppercase text-black'>
                      On this page
                    </p>
                    <h4
                      id='on-this-page-methodology-header'
                      className='mt-2 mb-4 font-sansTitle text-smallestHeader leading-lhNormal'
                    >
                      {routeConfig.label}
                    </h4>

                    <HetOnThisPageMenu
                      links={routeConfig.subLinks}
                      className='sticky right-0 top-24 z-almostTop h-min'
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
