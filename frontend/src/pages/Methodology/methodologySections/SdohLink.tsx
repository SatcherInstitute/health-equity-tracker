import DataTable from '../methodologyComponents/DataTable'
import KeyTerms from '../methodologyComponents/KeyTerms'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import Resources from '../methodologyComponents/Resources'
import { ageAdjustmentDefinitionsArray } from '../methodologyContent/AgeAdjustmentDefinitions'
import ConditionVariable from '../methodologyContent/ConditionVariable'
import {
  sdohDataSources,
  sdohDefinitionsArray,
} from '../methodologyContent/SdohDefinitions'
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
import { Helmet } from 'react-helmet-async'
import DefinitionTooltip from '../methodologyComponents/DefinitionTooltip'
import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'
import { totalCasesPer100kPeopleTooltip } from '../methodologyContent/TooltipLibrary'
import { CodeBlock } from '../methodologyComponents/CodeBlock'
import { Alert } from '@mui/material'
import AgeAdjustmentExampleTable from '../methodologyComponents/AgeAdjustmentExampleTable'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import DataAlertError from '../methodologyContent/DataAlertError'
import { missingAhrDataArray } from '../../DataCatalog/methodologyContent/missingDataBlurbs'

function SdohLink() {
  return (
    <section id="#sdoh">
      <article>
        <Helmet>
          <title>Social Determinants of Health - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>
          Social Determinants of Health
        </h2>
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
              category: 'Social Determinants of Health',
              topic:
                'Care Avoidance Due to Cost, Poverty, Uninsured Individuals, Preventable Hospitalization',
              variable: 'Race/ethnicity, Sex, Age',
            },
          ]}
        />
        <h3 id="#sdoh-data-sourcing">Data Sourcing</h3>

        <p>
          Social determinants of health in the tracker are sourced from{' '}
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
        <DataAlertError alertsArray={missingAhrDataArray} />
        <h3 id="#sdoh-key-terms">Key Terms</h3>
        <ConditionVariable definitionsArray={sdohDefinitionsArray} />
        <Resources id="#sdoh-resources" resourceGroups={[PDOH_RESOURCES]} />
        <h3 id="#sdoh-data-sources">Data Sources</h3>
        <AgeAdjustmentExampleTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Geographic Level', accessor: 'geo' },
            { header: 'Granularity', accessor: 'granularity' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={sdohDataSources.map((source, index) => ({
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

export default SdohLink
