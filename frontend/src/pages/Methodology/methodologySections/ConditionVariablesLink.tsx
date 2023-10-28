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
import { parseDescription } from '../methodologyComponents/DataTable'
import ConditionVariable from '../methodologyContent/ConditionVariable'
const ConditionVariablesLink = () => {
  return (
    <section id="condition-variables">
      <article>
        <Helmet>
          <title>Condition Variables - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>Condition Variables</h2>
        <ConditionVariable definitionsArray={conditionVariableDefinitions} />
      </article>
    </section>
  )
}

export default ConditionVariablesLink
