import { datasourceMetadataAcs } from '../../../data/config/DatasetMetadataAcs'
import { datasourceMetadataAhr } from '../../../data/config/DatasetMetadataAhr'
import { datasourceMetadataChr } from '../../../data/config/DatasetMetadataChr'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { SDOH_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigSDOH'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import HetTopicDemographics from '../../../styles/HetComponents/HetTopicDemographics'
import { urlMap } from '../../../utils/externalUrls'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import AhrMetrics from '../methodologyComponents/AhrMetrics'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import NoteBrfss from '../methodologyComponents/NoteBrfss'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import { PDOH_RESOURCES } from '../methodologyContent/ResourcesData'
import { buildTopicsString } from './linkUtils'

const sdohDataSources = [
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.ahr,
  dataSourceMetadataMap.chr,
  dataSourceMetadataMap.geo_context,
]

const datatypeConfigs = SDOH_CATEGORY_DROPDOWNIDS.flatMap((dropdownId) => {
  return METRIC_CONFIG[dropdownId]
})

export const sdohTopicsString = buildTopicsString(SDOH_CATEGORY_DROPDOWNIDS)

function SdohLink() {
  return (
    <section id='sdoh'>
      <article>
        <title>Social Determinants of Health - Health Equity Tracker</title>

        <StripedTable
          id='categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'Social Determinants of Health',
              topic: sdohTopicsString,
            },
          ]}
        />
        <h2 className='mt-12 font-medium text-title' id='sdoh-data-sourcing'>
          Data Sourcing
        </h2>
        <p>
          Our tracker's data on some social determinants of health including{' '}
          <HetTerm>preventable hospitalizations</HetTerm> are sourced from{' '}
          <a href={urlMap.ahr}>America’s Health Rankings (AHR)</a> and{' '}
          <a href={urlMap.chr}>County Health Rankings (CHR)</a>, both of which
          primarily rely on the{' '}
          <a href={urlMap.cdcBrfss}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>{' '}
          survey run by the CDC, augmented by{' '}
          <a href={urlMap.cdcWonder}>CDC WONDER</a> and the{' '}
          <a href={urlMap.censusVoting}>U.S. Census</a>.
        </p>
        <NoteBrfss />

        <AhrMetrics category='social-determinants' />

        <h3
          className='mt-12 font-medium text-title'
          id='demographic-stratification'
        >
          Demographic Stratification
        </h3>
        <HetTopicDemographics
          topicIds={[...SDOH_CATEGORY_DROPDOWNIDS]}
          datasourceMetadata={{
            ...datasourceMetadataChr,
            ...datasourceMetadataAhr,
            ...datasourceMetadataAcs,
          }}
        />

        <h3 className='mt-12 font-medium text-title' id='sdoh-data-sources'>
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={sdohDataSources.map((source) => ({
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
          hashId='sdoh-key-terms'
          datatypeConfigs={datatypeConfigs}
        />

        <Resources id='sdoh-resources' resourceGroups={[PDOH_RESOURCES]} />
      </article>
    </section>
  )
}

export default SdohLink
