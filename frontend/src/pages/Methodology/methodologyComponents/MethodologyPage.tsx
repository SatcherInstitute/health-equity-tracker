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
export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`

function MethodologyPage() {
  const location = useLocation()

  // Find the route object that matches the current path
  const activeRoute = routeConfigs.find(
    (route) => route.path === location.pathname
  )

  return (
    <>
      <Helmet>
        <title>Methodology - Health Equity Tracker</title>
      </Helmet>

      <h2 className={styles.ScreenreaderTitleHeader}>Methodology</h2>

      <Grid
        className={styles.MethodologySectionWrapper}
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        <MethodologyCardMenu />
        <main className={styles.ArticleContainer}>
          <Grid direction="column">
            <Typography className={styles.Header} variant="h1">
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
          </Grid>
        </main>
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
    </>
  )
}

export default MethodologyPage
