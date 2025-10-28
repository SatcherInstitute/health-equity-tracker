import { datasourceMetadataAhr } from '../../../data/config/DatasetMetadataAhr'
import { datasourceMetadataChr } from '../../../data/config/DatasetMetadataChr'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigChronicDisease'
import HetTopicDemographics from '../../../styles/HetComponents/HetTopicDemographics'
import { urlMap } from '../../../utils/externalUrls'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import AhrMetrics from '../methodologyComponents/AhrMetrics'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import NoteBrfss from '../methodologyComponents/NoteBrfss'
import StripedTable from '../methodologyComponents/StripedTable'
import { buildTopicsString } from './linkUtils'

const chronicDiseaseDataSources = [
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.ahr,
  dataSourceMetadataMap.chr,
]

const datatypeConfigs = CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS.flatMap(
  (dropdownId) => {
    return METRIC_CONFIG[dropdownId]
  },
)

export const chronicDiseaseTopicsString = buildTopicsString(
  CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS,
)

const ChronicDiseaseLink = () => {
  return (
    <section id='chronic-diseases'>
      <title>Chronic Diseases - Health Equity Tracker</title>
      <article>
        <StripedTable
          id='categories-table'
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
        <h2
          className='mt-12 font-medium text-title'
          id='chronic-diseases-data-sourcing'
        >
          Data Sourcing
        </h2>
        <p>
          For chronic diseases like COPD and diabetes, our tracker sources data
          primarily from{' '}
          <a href={urlMap.ahr}>America’s Health Rankings (AHR)</a> and{' '}
          <a href={urlMap.chr}>County Health Rankings (CHR)</a>, both of which
          primarily rely on the{' '}
          <a href={urlMap.cdcBrfss}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>{' '}
          , complemented by <a href={urlMap.cdcWonder}>CDC WONDER</a> and the{' '}
          <a href={urlMap.censusVoting}>U.S. Census</a> data. Given that BRFSS
          is survey-based, data availability can sometimes be limited,
          especially for smaller and marginalized racial and ethnic groups.
        </p>

        <NoteBrfss />
        <AhrMetrics />

        <h3
          className='mt-12 font-medium text-title'
          id='demographic-stratification'
        >
          Demographic Stratification
        </h3>
        <HetTopicDemographics
          topicIds={[...CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS]}
          datasourceMetadata={{
            ...datasourceMetadataChr,
            ...datasourceMetadataAhr,
          }}
        />
        <h3
          className='mt-12 font-medium text-title'
          id='chronic-diseases-data-sources'
        >
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={chronicDiseaseDataSources.map((source) => ({
            source: (
              <a
                key={source.data_source_name}
                href={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${source.id}`}
              >
                {source.data_source_name}
              </a>
            ),
            updates: source.update_frequency,
          }))}
        />

        <KeyTermsTopicsAccordion
          hashId='chronic-diseases-key-terms'
          datatypeConfigs={datatypeConfigs}
        />
      </article>
    </section>
  )
}

export default ChronicDiseaseLink
