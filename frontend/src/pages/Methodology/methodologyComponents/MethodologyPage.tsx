import Grid from '@mui/material/Grid'
import styles from './MethodologyPage.module.scss'
import { HET_URL } from '../../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import { currentYear } from '../../../cards/ui/SourcesHelpers'
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'
import MethodologyCardMenu from './MethodologyCardMenu'
import MethodologySubMenu from './MethodologySubMenu'
import { routeConfigs } from '.././methodologyContent/routeConfigs'
import { Typography } from '@mui/material'
import NavigationButtons from './NavigationButtons'
// import SearchBar from './SearchBar'
import MethodologyCardMenuMobile from './MethodologyCardMenuMobile'
import { useEffect, useState } from 'react'
import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'
export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`
export const defLookup = () => {
  // Map the original array to include the original index
  const indexedDefinitions = definitionsGlossary.map((item, index) => ({
    item,
    originalIndex: index,
  }))

  // Sort the array based on the topic
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

  // Find the route object that matches the current path
  const activeRoute = routeConfigs.find(
    (route) => route.path === location.pathname
  )

  return (
    <main className={styles.MethodologySectionWrapper}>
      <Helmet>
        <title>Methodology - Health Equity Tracker</title>
      </Helmet>

      <h2 className={styles.ScreenreaderTitleHeader}>Methodology</h2>

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

        <Grid item xs={12} sm={6} className={styles.SectionWrapper}>
          <article className={styles.ArticleContainer}>
            <Typography variant="h1">{activeRoute?.label}</Typography>
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
        </Grid>

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
    </main>
  )
}

export default MethodologyPage
