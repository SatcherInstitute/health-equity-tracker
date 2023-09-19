import Grid from '@mui/material/Grid'
import Item, { createTheme } from '@mui/material'
import styles from './DataCatalogPage.module.scss'
import {
  CONTACT_TAB_LINK,
  HET_URL,
  DATA_TAB_LINK,
} from '../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import { getHtml, LinkWithStickyParams } from '../../utils/urlutils'
import { selectFaqs } from '../WhatIsHealthEquity/FaqTab'
import { METRIC_CONFIG } from '../../data/config/MetricConfig'
import { Card } from '@mui/material'
import { urlMap } from '../../utils/externalUrls'
import DefinitionsList from '../../reports/ui/DefinitionsList'
import { currentYear } from '../../Footer'
import {
  ALASKA_PRIVATE_JAIL_CAVEAT,
  CombinedIncarcerationStateMessage,
} from '../../data/providers/IncarcerationProvider'
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom'
import {
  MissingCAWPData,
  MissingCovidData,
  MissingCovidVaccinationData,
  MissingHIVData,
  MissingPrepData,
  MissingAHRData,
  MissingPhrmaData,
} from './methodologyContent/missingDataBlurbs'
import { SHOW_PHRMA } from '../../data/providers/PhrmaProvider'
import MethodologyCardMenu from './MethodologyCardMenu'

import MethodologySubMenu from './MethodologySubMenu'
import { Source } from '@mui/icons-material'

import { routeConfigs } from './methodologyContent/routeConfigs'
export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`
import React, { useState } from 'react'

interface LinkConfig {
  label: string
  path: string
}

interface MethodologySubMenuProps {
  links: LinkConfig[]
}

const MethodologyTabV2: React.FC = () => {
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
