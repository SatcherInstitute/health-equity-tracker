import Grid from '@mui/material/Grid'
import { HET_URL } from '../../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import { currentYear } from '../../../cards/ui/SourcesHelpers'
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'
import MethodologyCardMenu from './MethodologyCardMenu'
import MethodologySubMenu from './MethodologySubMenu'
import { routeConfigs } from '.././methodologyContent/routeConfigs'
import NavigationButtons from './NavigationButtons'
import MethodologyCardMenuMobile from './MethodologyCardMenuMobile'
import { useEffect, useState } from 'react'
import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'
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

const MethodologyPage: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const location = useLocation()

  const activeRoute = routeConfigs.find(
    (route) => route.path === location.pathname
  )

  return (
    <div className='m-1'>
      <Helmet>
        <title>Methodology - Health Equity Tracker</title>
      </Helmet>

      <h2 className='sr-only'>Methodology</h2>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          {windowWidth < 600 ? (
            <MethodologyCardMenuMobile />
          ) : (
            <MethodologyCardMenu />
          )}
        </Grid>

        {windowWidth < 600 && (
          <Grid item xs={12} sm={3}>
            {routeConfigs.map((route, index) => {
              const match = useRouteMatch({
                path: route.path,
                exact: true,
              })

              return match && route.subLinks.length > 0 ? (
                <MethodologySubMenu key={index} links={route.subLinks} />
              ) : null
            })}
          </Grid>
        )}

        <div className='mt-8 flex p-0'>
          <article className='flex w-full flex-col p-8 text-left sm:w-1/2 lg:p-0 '>
            <h2 className='font-serif text-header font-light' id='main'>
              {activeRoute?.label}
            </h2>
            <Switch>
              <>
                {routeConfigs.map((route, index) => (
                  <Route
                    key={index}
                    exact
                    path={route.path}
                    component={route.component}
                  />
                ))}
                <NavigationButtons />
              </>
            </Switch>
          </article>
        </div>

        {windowWidth >= 600 && (
          <Grid item xs={12} sm={3}>
            {routeConfigs.map((route, index) => {
              const match = useRouteMatch({
                path: route.path,
                exact: true,
              })

              return match && route.subLinks.length > 0 ? (
                <MethodologySubMenu key={index} links={route.subLinks} />
              ) : null
            })}
          </Grid>
        )}
      </Grid>
    </div>
  )
}

export default MethodologyPage
