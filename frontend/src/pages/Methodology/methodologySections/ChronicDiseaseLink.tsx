import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { urlMap } from '../../../utils/externalUrls'
import KeyTerms from '../methodologyComponents/KeyTerms'
import {
  chronicDiseaseDataSources,
  chronicDiseaseDefinitionsArray,
} from '../methodologyContent/ChronicDiseaseDefinitions'
import DataTable from '../methodologyComponents/DataTable'
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
import Resources from '../methodologyComponents/Resources'
import ConditionVariable from '../methodologyContent/ConditionVariable'
import { Helmet } from 'react-helmet-async'
import { Alert } from '@mui/material'
import { CodeBlock } from '../methodologyComponents/CodeBlock'
import { totalCasesPer100kPeopleTooltip } from '../methodologyContent/TooltipLibrary'
import AgeAdjustmentExampleTable from '../methodologyComponents/AgeAdjustmentExampleTable'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'

const ChronicDiseaseLink = () => {
  return (
    <section id="#chronic-diseases">
      <article>
        <Helmet>
          <title>Chronic Diseases - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>Chronic Diseases</h2>
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
              category: 'Chronic Diseases',
              topic:
                'Asthma, Cardiovascular Diseases, Chronic Kidney Disease, COPD, Diabetes',
              variable: 'Race/ethnicity, Sex, Age',
            },
          ]}
        />
        <h3 id="#chronic-diseases-data-sourcing">Data Sourcing</h3>
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
        <p>
          Multiple chronic disease, behavioral health, and social determinants
          of health in the tracker are sourced from{' '}
          <a href={'urlMap.amr'}>America’s Health Rankings (AHR)</a>, who in
          turn source the majority of their data from the{' '}
          <a href={'urlMap.cdcBrfss'}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>
          , a survey run by the CDC, along with supplemental data from{' '}
          <a href={'urlMap.cdcWonder'}>CDC WONDER</a> and the{' '}
          <a href={'urlMap.censusVoting'}>US Census</a>.
          <a href={urlMap.amr}>America’s Health Rankings (AHR)</a>, who in turn
          source the majority of their data from the{' '}
          <a href={urlMap.cdcBrfss}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>
          , a survey run by the CDC, along with supplemental data from{' '}
          <a href={urlMap.cdcWonder}>CDC WONDER</a> and the{' '}
          <a href={urlMap.censusVoting}>US Census</a>.
        </p>
        <ul>
          <li>
            Because BRFSS is a survey, there are not always enough respondents
            to provide a statistically meaningful estimate of disease
            prevalence, especially for smaller and typically marginalized racial
            groups. Please see the{' '}
            <a href={'urlMap.amrMethodology'}>methodology page</a> of America’s
            <a href={urlMap.amrMethodology}>methodology page</a> of America’s
            Health Rankings for details on data suppression.
          </li>
          <li>
            BRFSS data broken down by race and ethnicity is not available at the
            county level, so the tracker does not display these conditions at
            the county level either.
          </li>
          <li>
            All metrics sourced from America’s Health Rankings are calculated
            based on the rates provided from their downloadable data files:
            <ul>
              <li>
                For most conditions, AHR provides these rates as a percentage,
                though in some cases they use cases per 100,000. If we present
                the condition using the same units, we simply pass the data
                along directly. If we need to convert a rate they present as a{' '}
                <b>percent</b> into a <b>per 100k</b>, we multiply their percent
                amount by 1,000 to obtain the new per 100k rate.
                <code>5% (of 100) === 5,000 per 100,000</code>.
              </li>
              <li>
                For COPD, diabetes, frequent mental distress, depression,
                excessive drinking, asthma, avoided care, and suicide, we source
                the <b>percent share</b> metrics directly from AHR.
              </li>
            </ul>
          </li>
        </ul>
        <br />
        <h3 id="#chronic-diseases-key-terms">Key Terms</h3>
        <ConditionVariable definitionsArray={chronicDiseaseDefinitionsArray} />
        <h3 id="#chronic-diseases-data-sources">Data Sources</h3>
        <AgeAdjustmentExampleTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Geographic Level', accessor: 'geo' },
            { header: 'Granularity', accessor: 'granularity' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={chronicDiseaseDataSources.map((source, index) => ({
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

export default ChronicDiseaseLink
