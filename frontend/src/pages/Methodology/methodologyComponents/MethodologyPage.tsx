import { HET_URL } from '../../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import { currentYear } from '../../../cards/ui/SourcesHelpers'
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'
import MethodologyCardMenu from './MethodologyCardMenu'
import { routeConfigs } from '.././methodologyContent/routeConfigs'
import MethodologyPagination from './MethodologyPagination'
import MethodologyCardMenuMobile from './MethodologyCardMenuMobile'
import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'
import HetOnThisPageMenu from '../../../styles/HetComponents/HetOnThisPageMenu'

export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`
export const defLookup = () => {
  const indexedDefinitions = definitionsGlossary.map((item, index) => ({
    item,
    originalIndex: index,
  }))

  indexedDefinitions
    .sort((a, b) => a.item.topic.localeCompare(b.item.topic))
    .forEach(({ item, originalIndex }) => {
      console.log(item.topic, originalIndex)
    })
}

export default function MethodologyPage() {
  const location = useLocation()

  const activeRoute = routeConfigs.find(
    (route) => route.path === location.pathname
  )

  return (
    <>
      <Helmet>
        <title>Methodology - Health Equity Tracker</title>
      </Helmet>

      <div className='flex justify-center'>
        <h2 className='sr-only'>Methodology</h2>

        <section className='m-[2%] max-w-xl'>
          <div className='flex flex-col justify-items-center smMd:flex-row smMd:gap-2 md:gap-12'>
            {/* MAIN METHODOLOGY PAGES MENU */}
            <div className='min-w-fit'>
              <MethodologyCardMenu className='sticky top-4 z-top hidden h-min max-w-menu smMd:block' />
              <MethodologyCardMenuMobile className='m-3 smMd:hidden' />
            </div>

            {/* CONTENT */}
            <div className='flex flex-wrap p-1'>
              {/* ON THIS PAGE SUB-MENU - MOBILE/TABLET */}
              <div className='px-12 lg:hidden'>
                {routeConfigs.map((route, index) => {
                  const match = useRouteMatch({
                    path: route.path,
                    exact: true,
                  })
                  return match && route.subLinks.length > 0 ? (
                    <HetOnThisPageMenu
                      key={index}
                      links={route.subLinks}
                      className=''
                    />
                  ) : null
                })}
              </div>

              <article className='flex w-full flex-col p-8 text-left lg:p-0 '>
                {/* HEADING */}
                <h2 className='font-serif text-header font-light' id='main'>
                  {activeRoute?.label}
                </h2>

                <Switch>
                  <>
                    {/* TEXT */}
                    {routeConfigs.map((route, index) => (
                      <Route
                        key={index}
                        exact
                        path={route.path}
                        component={route.component}
                      />
                    ))}
                    {/* PREV / NEXT */}
                    <MethodologyPagination />
                  </>
                </Switch>
              </article>
            </div>

            {/* ON THIS PAGE SUB-MENU - DESKTOP */}
            <div className='hidden min-w-fit lg:block'>
              {routeConfigs.map((route, index) => {
                const match = useRouteMatch({
                  path: route.path,
                  exact: true,
                })
                return match && route.subLinks.length > 0 ? (
                  <HetOnThisPageMenu
                    key={index}
                    links={route.subLinks}
                    className='sticky right-0 top-4  z-top h-min'
                  />
                ) : null
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
