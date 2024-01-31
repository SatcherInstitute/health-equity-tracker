import { MENTAL_HEALTH_RESOURCES } from '../../WhatIsHealthEquity/ResourcesData'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import { Helmet } from 'react-helmet-async'
import { CodeBlock } from '../methodologyComponents/CodeBlock'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import LifelineAlert from '../../../reports/ui/LifelineAlert'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import KeyTermsAccordion from '../methodologyComponents/KeyTermsAccordion'
import { BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigBehavioralHealth'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { DROPDOWN_TOPIC_MAP } from '../../../utils/MadLibs'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'

// All data _sources_ used for Behavioral Health category
const behavioralHealthDataSources = [
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.ahr,
]

// All metric configs used for Behavioral Health category topics
const datatypeConfigs = BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS.map(
  (dropdownId) => {
    return METRIC_CONFIG[dropdownId]
  }
).flat()

// All sentence-cased topic names for Behavioral Health category
export const behavioralHealthTopicsString =
  BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS.map((dropdownId) => {
    return DROPDOWN_TOPIC_MAP[dropdownId]
  }).join(', ')

export default function BehavioralHealthLink() {
  return (
    <section id='#behavioral-health'>
      <article>
        <Helmet>
          <title>Behavioral Health - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Behavioral Health</h2>

        <StripedTable
          id='#categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'Behavioral Health',
              topic: behavioralHealthTopicsString,
            },
          ]}
        />
        <h3
          className='mt-12 text-title font-medium'
          id='#behavioral-health-data-sourcing'
        >
          Data Sourcing
        </h3>
        <p>
          The data on behavioral health conditions such as frequent mental
          distress, depression, and excessive drinking, featured in the Health
          Equity Tracker, primarily comes from{' '}
          <a href={'urlMap.amr'}>America’s Health Rankings (AHR)</a>. AHR
          primarily relies on the{' '}
          <a href={'urlMap.cdcBrfss'}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>{' '}
          survey conducted by the CDC, supplemented by data from{' '}
          <a href={'urlMap.cdcWonder'}>CDC WONDER</a> and the{' '}
          <a href={'urlMap.censusVoting'}>U.S. Census</a>.{' '}
        </p>
        <HetNotice
          className='my-12'
          title="A note about the CDC's Behavioral Risk Factor Surveillance System
            (BRFSS) survey"
        >
          <p>
            It's important to note that because BRFSS is survey-based, it
            sometimes lacks sufficient data for smaller or marginalized racial
            groups, making some estimates less statistically robust.
          </p>
          <p>
            Additionally, BRFSS data by race and ethnicity is not available at
            the county level, limiting our tracker's granularity for these
            metrics.
          </p>
        </HetNotice>
        <p>
          We obtain our data for the following specific issues directly from
          America's Health Rankings (AHR). This data is based on{' '}
          <HetTerm>percent share</HetTerm> metrics that AHR provides in
          downloadable data files. Click on the following to explore the
          reports:
        </p>

        <p>
          AHR usually gives us rates as percentages. In some cases, they provide
          the number of cases for every 100,000 people. We keep the data in the
          format AHR provides it. If we need to change a{' '}
          <HetTerm>percentage rate</HetTerm> into a{' '}
          <HetTerm>cases per 100k</HetTerm> rate, we simply multiply the
          percentage by 1,000. For example, a 5% rate would become 5,000 per
          100,000 people.
        </p>
        <CodeBlock
          rowData={[
            {
              content: '5% rate (of 100)',
            },
            {
              content: '===',
            },
            {
              content: (
                <>
                  <b>5,000 per 100,000 people</b>
                </>
              ),
            },
          ]}
        />

        <h3
          className='mt-12 text-title font-medium'
          id='#behavioral-health-data-sources'
        >
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
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
            updates: source.update_frequency,
          }))}
        />
        <KeyTermsAccordion
          hashId='#behavioral-health-key-terms'
          datatypeConfigs={datatypeConfigs}
        />

        <Resources
          id='#behavioral-health-resources'
          resourceGroups={[MENTAL_HEALTH_RESOURCES]}
        />

        <div className='pt-5'>
          <LifelineAlert />
        </div>
      </article>
    </section>
  )
}
