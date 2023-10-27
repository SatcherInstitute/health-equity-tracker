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
const ConditionVariablesLink = () => {
  return (
    <section>
      <article>
        <Helmet>
          <title>
            Health Equity Resources - What Is Health Equity? - Health Equity
            Tracker
          </title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>
          Health Equity Resources
        </h2>

        <div id={''} className={styles.GlossaryTermContainer}>
          {conditionVariableDefinitions.map((item) => {
            return (
              <div key={item.topic}>
                <h3>{item.topic}</h3>
                {item.definitions.map((def) => {
                  return (
                    <figure key={def.key}>
                      <span className={styles.ConditionKey}>
                        <strong>{def.key}:</strong>{' '}
                      </span>
                      <p className={styles.ConditionDefinition}>
                        {parseDescription(def.description)}
                      </p>
                    </figure>
                  )
                })}
              </div>
            )
          })}
        </div>

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
