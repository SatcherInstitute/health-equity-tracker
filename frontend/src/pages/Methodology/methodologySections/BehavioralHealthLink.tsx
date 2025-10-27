import { datasourceMetadataAhr } from '../../../data/config/DatasetMetadataAhr'
import { datasourceMetadataChr } from '../../../data/config/DatasetMetadataChr'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigBehavioralHealth'
import LifelineAlert from '../../../reports/ui/LifelineAlert'
import HetTopicDemographics from '../../../styles/HetComponents/HetTopicDemographics'
import { urlMap } from '../../../utils/externalUrls'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import AhrMetrics from '../methodologyComponents/AhrMetrics'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import NoteBrfss from '../methodologyComponents/NoteBrfss'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import { MENTAL_HEALTH_RESOURCES } from '../methodologyContent/ResourcesData'
import { buildTopicsString } from './linkUtils'

// All data _sources_ used for Behavioral Health category
const behavioralHealthDataSources = [
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.ahr,
  dataSourceMetadataMap.chr,
]

// All metric configs used for Behavioral Health category topics
const datatypeConfigs = BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS.flatMap(
  (dropdownId) => {
    return METRIC_CONFIG[dropdownId]
  },
)

export const behavioralHealthTopicsString = buildTopicsString(
  BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS,
)

export default function BehavioralHealthLink() {
  return (
    <section id='behavioral-health'>
      <title>Behavioral Health - Health Equity Tracker</title>
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
              category: 'Behavioral Health',
              topic: behavioralHealthTopicsString,
            },
          ]}
        />
        <h2
          className='mt-12 font-medium text-title'
          id='behavioral-health-data-sourcing'
        >
          Data Sourcing
        </h2>
        <p>
          The data on behavioral health conditions such as frequent mental
          distress, depression, and excessive drinking, featured in the Health
          Equity Tracker, come from{' '}
          <a href={urlMap.ahr}>America’s Health Rankings (AHR)</a> and{' '}
          <a href={urlMap.chr}>County Health Rankings (CHR)</a>, both of which
          primarily rely on the{' '}
          <a href={urlMap.cdcBrfss}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>{' '}
          survey conducted by the CDC, supplemented by data from{' '}
          <a href={urlMap.cdcWonder}>CDC WONDER</a> and the{' '}
          <a href={urlMap.censusVoting}>U.S. Census</a>.{' '}
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
          topicIds={[...BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS]}
          datasourceMetadata={{
            ...datasourceMetadataAhr,
            ...datasourceMetadataChr,
          }}
        />

        <h3
          className='mt-12 font-medium text-title'
          id='behavioral-health-data-sources'
        >
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={behavioralHealthDataSources.map((source) => ({
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
          hashId='behavioral-health-key-terms'
          datatypeConfigs={datatypeConfigs}
        />

        <Resources
          id='behavioral-health-resources'
          resourceGroups={[MENTAL_HEALTH_RESOURCES]}
        />

        <div className='pt-5'>
          <LifelineAlert />
        </div>
      </article>
    </section>
  )
}
