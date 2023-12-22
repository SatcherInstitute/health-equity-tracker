import { HET_URL } from '../../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import { currentYear } from '../../../cards/ui/SourcesHelpers'
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'
import MethodologyCardMenu from './MethodologyCardMenu'
import MethodologySubMenu from './MethodologySubMenu'
import { routeConfigs } from '.././methodologyContent/routeConfigs'
import NavigationButtons from './NavigationButtons'
import MethodologyCardMenuMobile from './MethodologyCardMenuMobile'
import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'
import { useIsBreakpointAndUp } from '../../../utils/hooks/useIsBreakpointAndUp'
import styles from '../Methodology.module.scss'

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
  const isDesktop = useIsBreakpointAndUp('md')

  const location = useLocation()

  const activeRoute = routeConfigs.find(
    (route) => route.path === location.pathname
  )

  return (
    <>
      <Helmet>
        <title>Methodology - Health Equity Tracker</title>
      </Helmet>

      <div className={styles.MethodologySectionWrapper}>
        <h2 className='sr-only'>Methodology</h2>

        <div className='grid grid-cols-1 gap-12  md:grid-cols-5'>
          {/* MAIN METHODOLOGY PAGES MENU */}
          {isDesktop ? <MethodologyCardMenu /> : <MethodologyCardMenuMobile />}

          {/* ON THIS PAGE SUB-MENU - MOBILE */}
          {!isDesktop && (
            <>
              {routeConfigs.map((route, index) => {
                const match = useRouteMatch({
                  path: route.path,
                  exact: true,
                })
                return match && route.subLinks.length > 0 ? (
                  <MethodologySubMenu key={index} links={route.subLinks} />
                ) : null
              })}
            </>
          )}

          {/* CONTENT */}
          <div className='mt-8 flex p-0 md:col-span-3'>
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
                  <NavigationButtons />
                </>
              </Switch>
            </article>
          </div>

          {/* ON THIS PAGE SUB-MENU - DESKTOP */}
          {isDesktop && (
            <div>
              {routeConfigs.map((route, index) => {
                const match = useRouteMatch({
                  path: route.path,
                  exact: true,
                })
                return match && route.subLinks.length > 0 ? (
                  <MethodologySubMenu key={index} links={route.subLinks} />
                ) : null
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
