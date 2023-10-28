// import { Alert } from '@mui/material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Grid,
  Typography,
} from '@mui/material'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import {
  behavioralHealthDataSources,
  behavioralHealthDefinitionsArray,
} from '../methodologyContent/BehavioralHealthDefinitions'
import KeyTerms from '../methodologyComponents/KeyTerms'
import DataTable from '../methodologyComponents/DataTable'
import { conditionVariableDefinitions } from '../methodologyContent/ConditionVariableDefinitions'
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
} from '../../WhatIsHealthEquity/ResourcesData'
import ConditionVariable from '../methodologyContent/ConditionVariable'
import Resources from '../methodologyComponents/Resources'
import AgeAdjustmentExampleTable from '../methodologyComponents/AgeAdjustmentExampleTable'
import { Helmet } from 'react-helmet-async'
import { CodeBlock } from '../methodologyComponents/CodeBlock'
import { totalCasesPer100kPeopleTooltip } from '../methodologyContent/TooltipLibrary'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import MissingDataAlert from '../methodologyContent/DataAlertError'
import { missingDataArray } from '../methodologyContent/SourcesDefinitions'

const BehavioralHealthLink: React.FC = () => {
  console.log([missingDataArray[0].definitions[0]][0].key)
  return (
    <section id="#behavioral-health">
      <article>
        <Helmet>
          <title>Behavioral Health - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>Behavioral Health</h2>
        <br />

        <AgeAdjustmentExampleTable
          id="#categories-table"
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
            { header: 'Variables', accessor: 'variable' },
          ]}
          rows={[
            {
              category: 'Behavioral Health',
              topic:
                'Depression, Excessive Drinking, Frequent Mental Distress, Suicide, Opioid and Substance Misuse',
              variable: 'Race/ethnicity, Sex, Age',
            },
          ]}
        />
        <h3 id="#behavioral-health-data-sourcing">Data Sourcing</h3>
        <p>
          Multiple chronic diseases, behavioral health, and social determinants
          of health in the tracker are sourced from{' '}
          <a href={'urlMap.amr'}>America’s Health Rankings (AHR)</a>, who in
          turn source the majority of their data from the{' '}
          <a href={'urlMap.cdcBrfss'}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>
          , a survey run by the CDC, along with supplemental data from{' '}
          <a href={'urlMap.cdcWonder'}>CDC WONDER</a> and the{' '}
          <a href={'urlMap.censusVoting'}>US Census</a>.
        </p>
        <p>
          Because BRFSS is a survey, there are not always enough respondents to
          provide a statistically meaningful estimate of disease prevalence,
          especially for smaller and typically marginalized racial groups.
        </p>
        <p>
          BRFSS data broken down by race and ethnicity is not available at the
          county level, so the tracker does not display these conditions at the
          county level either.
        </p>

        <p>
          All metrics sourced from America’s Health Rankings are calculated
          based on the rates provided from their downloadable data files:
        </p>
        <p>
          For most conditions, AHR provides these rates as a percentage, though
          in some cases they use cases per 100,000. If we present the condition
          using the same units, we simply pass the data along directly.
        </p>
        <Alert severity="info" role="note">
          If we need to convert a rate they present as a <b>percent</b> into a{' '}
          <b>per 100k</b>, we multiply their percent amount by 1,000 to obtain
          the new {totalCasesPer100kPeopleTooltip} rate.
        </Alert>
        <CodeBlock
          rowData={[
            {
              content: '5% (of 100)',
            },
            {
              content: '===',
            },
            {
              content: (
                <>
                  <b>5,000 per 100,000</b>
                </>
              ),
            },
          ]}
        />
        <p>
          For COPD, diabetes, frequent mental distress, depression, excessive
          drinking, asthma, avoided care, and suicide, we source the{' '}
          <b>percent share</b> metrics directly from AHR.
        </p>
        <AgeAdjustmentExampleTable
          columns={[
            { header: 'Race Groups by Age', accessor: 'race' },
            { header: 'HIV Deaths', accessor: 'condition' },
            { header: 'Population', accessor: 'population' },
          ]}
          rows={[
            {
              race: `Race A (ages 0 - 29)`,
              condition: `50`,
              population: `600,000`,
            },
            {
              race: `Race B (ages 0 - 29)`,
              condition: `20`,
              population: `200,000`,
            },
            {
              race: `Race A (ages 30 - 59)`,
              condition: `500`,
              population: `800,000`,
            },
            {
              race: `Race B (ages 30 - 59)`,
              condition: `200`,
              population: `300,000`,
            },
            {
              race: `Race A (ages 60+)`,
              condition: `5,000`,
              population: `200,000`,
            },
            {
              race: `Race B (ages 60+)`,
              condition: `800`,
              population: `60,000`,
            },
          ]}
        />

        <h3 id="#behavioral-health-key-terms">Key Terms</h3>
        <ConditionVariable
          definitionsArray={behavioralHealthDefinitionsArray}
        />
        <Resources
          id="#behavioral-health-resources"
          resourceGroups={[MENTAL_HEALTH_RESOURCES]}
        />
        <h3 id="#behavioral-health-data-sources">Data Sources</h3>
        <AgeAdjustmentExampleTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Geographic Level', accessor: 'geo' },
            { header: 'Granularity', accessor: 'granularity' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={behavioralHealthDataSources.map((source, index) => ({
            source: (
              <a
                key={index}
                href={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${source.id}`}
              >
                {source.data_source_name}
              </a>
            ),
            geo: source.geographic_level,
            granularity: source.demographic_granularity,
            updates: source.update_frequency,
          }))}
        />
      </article>
    </section>
  )
}

export default BehavioralHealthLink
