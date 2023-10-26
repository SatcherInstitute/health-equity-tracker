import { Link } from 'react-router-dom'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import DefinitionsList from '../../../reports/ui/DefinitionsList'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import DataTable from '../methodologyComponents/DataTable'
import { conditionVariableDefinitions } from '../methodologyContent/ConditionVariableDefinitions'
// import styles from './WhatIsHealthEquityPage.module.scss'
import { Typography, Grid } from '@mui/material'
import { Helmet } from 'react-helmet-async'
import {
  RESOURCES,
  PDOH_RESOURCES,
  EQUITY_INDEX_RESOURCES,
  AIAN_RESOURCES,
  API_RESOURCES,
  HISP_RESOURCES,
  MENTAL_HEALTH_RESOURCES,
  COVID_RESOURCES,
  COVID_VACCINATION_RESOURCES,
  ECONOMIC_EQUITY_RESOURCES,
  HIV_RESOURCES,
} from '../../../../src/pages/WhatIsHealthEquity/ResourcesData'

const ConditionVariablesLink = () => {
  return (
    <section>
      <article>
        <>
          <Helmet>
            <title>
              Health Equity Resources - What Is Health Equity? - Health Equity
              Tracker
            </title>
          </Helmet>
          <h2 className={styles.ScreenreaderTitleHeader}>
            Health Equity Resources
          </h2>
          <Grid container className={styles.Grid}>
            <Grid container className={styles.ResourcesTabSection}>
              {[RESOURCES].map(({ heading, resources }) => {
                // first heading should get a "main" id for Playwright testing and our a11y setups
                const id = heading === 'Health Equity' ? 'main' : heading
                return (
                  <Grid
                    container
                    className={styles.ResourcesGroup}
                    key={heading}
                  >
                    <Grid item xs={12} sm={12} md={3}>
                      <Typography
                        id={id}
                        tabIndex={-1}
                        className={styles.ResourcesTabHeaderText}
                      >
                        {heading}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={9}>
                      <Grid container>
                        <Grid item>
                          <ul className={styles.ResourcesTabList}>
                            {resources.map(
                              (resource: {
                                // eslint-disable-next-line @typescript-eslint/ban-types
                                name: {} | null | undefined
                                url: string | undefined
                              }) => (
                                <li
                                  className={styles.ResourcesTabListItem}
                                  key={resource.name}
                                >
                                  <a href={resource.url}>{resource.name}</a>
                                </li>
                              )
                            )}
                          </ul>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )
              })}
            </Grid>
          </Grid>
        </>
        <p>
          Links to the original sources of data and their definitions can be
          found on our <Link to={'DATA_CATALOG_PAGE_LINK'}>Data Downloads</Link>{' '}
          page.
        </p>
        <DataTable
          headers={{
            topic: '',
            definition: 'Variables that Affect Health Conditions',
          }}
          methodologyTableDefinitions={conditionVariableDefinitions}
        />
      </article>
    </section>
  )
}

export default ConditionVariablesLink
