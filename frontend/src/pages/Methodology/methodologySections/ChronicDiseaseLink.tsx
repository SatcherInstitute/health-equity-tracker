import { Helmet } from 'react-helmet-async'
import StripedTable from '../methodologyComponents/StripedTable'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigChronicDisease'
import {
  METRIC_CONFIG,
  buildTopicsString,
} from '../../../data/config/MetricConfig'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import NoteBrfss from '../methodologyComponents/NoteBrfss'
import AhrMetrics from '../methodologyComponents/AhrMetrics'

export const chronicDiseaseDataSources = [
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.ahr,
]

const datatypeConfigs = CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS.flatMap(
  (dropdownId) => {
    return METRIC_CONFIG[dropdownId]
  }
)

export const chronicDiseaseTopicsString = buildTopicsString(
  CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS
)

const ChronicDiseaseLink = () => {
  return (
    <section id='#chronic-diseases'>
      <article>
        <Helmet>
          <title>Chronic Diseases - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Chronic Diseases</h2>

        <StripedTable
          id='#categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'Chronic Diseases',
              topic: chronicDiseaseTopicsString,
            },
          ]}
        />
        <h3
          className='mt-12 text-title font-medium'
          id='#chronic-diseases-data-sourcing'
        >
          Data Sourcing
        </h3>
        <p>
          For chronic diseases like COPD and diabetes, our tracker sources data
          primarily from{' '}
          <a href={'urlMap.amr'}>America’s Health Rankings (AHR)</a>, which
          predominantly obtains its data from the CDC's{' '}
          <a href={'urlMap.cdcBrfss'}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>{' '}
          , complemented by <a href={'urlMap.cdcWonder'}>CDC WONDER</a> and the{' '}
          <a href={'urlMap.censusVoting'}>U.S. Census</a> data. Given that BRFSS
          is survey-based, data availability can sometimes be limited,
          especially for smaller and marginalized racial and ethnic groups.
        </p>

        <NoteBrfss />
        <AhrMetrics />

        <h3
          className='mt-12 text-title font-medium'
          id='#chronic-diseases-data-sources'
        >
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
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
            updates: source.update_frequency,
          }))}
        />

        <KeyTermsTopicsAccordion
          hashId='#chronic-diseases-key-terms'
          datatypeConfigs={datatypeConfigs}
        />
      </article>
    </section>
  )
}

export default ChronicDiseaseLink
