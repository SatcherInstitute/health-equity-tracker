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
import SearchBar from './SearchBar'
export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`

const MethodologyPage = () => {
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
          <MethodologyCardMenu />
        </Grid>


        {/* <SearchBar/> */}
        <Grid item xs={12} sm={6}>
          <article className={styles.ArticleContainer}>

            <Typography variant="h1">
              {activeRoute?.label}
            </Typography>
            <Switch>
              <>
                {routeConfigs.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    render={route.component}
                  />
                ))}
                <NavigationButtons />
              </>
            </Switch>

          </article>
        </Grid>

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
      </Grid>
    </main>
  )
}

export default MethodologyPage
