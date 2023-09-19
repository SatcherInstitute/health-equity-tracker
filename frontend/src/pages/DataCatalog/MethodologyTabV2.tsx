import Grid from '@mui/material/Grid'
import styles from './DataCatalogPage.module.scss'
import {
  HET_URL,
} from '../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import { currentYear } from '../../Footer'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import MethodologyCardMenu from './MethodologyCardMenu'
import MethodologySubMenu from './MethodologySubMenu'
import React from 'react'

import { routeConfigs } from './methodologyContent/routeConfigs'
export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`

// interface LinkConfig {
//   label: string
//   path: string
// }

// interface MethodologySubMenuProps {
//   links: LinkConfig[]
// }

function MethodologyTabV2() {
  return (
    <>
      <Helmet>
        <title>Methodology - Health Equity Tracker - v2</title>
      </Helmet>

      <h2 className={styles.ScreenreaderTitleHeader}>Methodology v2</h2>

      <Grid
        className={styles.MethodologySectionWrapper}
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        <MethodologyCardMenu />

        <main className={styles.ArticleContainer}>
          <Switch>
            {routeConfigs.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                component={route.component}
              />
            ))}
          </Switch>
        </main>
        {routeConfigs.map((route, index) => {
          const match = useRouteMatch({
            path: route.path,
            exact: true, // Optional, set to true if you want to match the route exactly
          })

          return match && route.subLinks.length > 0 ? (
            <MethodologySubMenu key={index} links={route.subLinks} />
          ) : null
        })}
      </Grid>
    </>
  )
}

export default MethodologyTabV2
