import { datasourceMetadataCdcWonder } from '../../../data/config/DatasetMetadataCdcWonder'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { CDC_CANCER_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigCancer'
import HetTopicDemographics from '../../../styles/HetComponents/HetTopicDemographics'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import { CANCER_RESOURCES } from '../methodologyContent/ResourcesData'
import { buildTopicsString } from './linkUtils'

const cancerDataSources = [dataSourceMetadataMap.cdc_wonder]

const datatypeConfigs = CDC_CANCER_CATEGORY_DROPDOWNIDS.flatMap(
  (dropdownId) => {
    return METRIC_CONFIG[dropdownId]
  },
)

export const cancerTopicsString = buildTopicsString(
  CDC_CANCER_CATEGORY_DROPDOWNIDS,
)

function CancerLink() {
  return (
    <section id='cancer'>
      <article>
        <title>Cancer and Cancer Screenings - Health Equity Tracker</title>

        <StripedTable
          id='categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'Cancer',
              topic: cancerTopicsString,
            },
          ]}
        />
        <h2 className='mt-12 font-medium text-title' id='cancer-data-sourcing'>
          Data Sourcing
        </h2>
        {/* TODO: NEED CANCER WRITEUP, INCLUDING CDC WONDER FOR DISEASE RATES AND BRFSS/PHRMA FOR SCREENING ADHERENCE */}
        <p>CDC Wonder</p>
        {/* KEEP THIS BRFSS NOTICE? DOES IT APPLY TO THE SCREENING DATA? */}
        {/* <NoteBrfss /> */}

        <h3
          className='mt-12 font-medium text-title'
          id='demographic-stratification'
        >
          Demographic Stratification
        </h3>
        <HetTopicDemographics
          topicIds={[...CDC_CANCER_CATEGORY_DROPDOWNIDS]}
          datasourceMetadata={{
            ...datasourceMetadataCdcWonder,
          }}
        />

        <h3 className='mt-12 font-medium text-title' id='cancer-data-sources'>
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={cancerDataSources.map((source) => ({
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
          hashId='cancer-key-terms'
          datatypeConfigs={datatypeConfigs}
        />

        <Resources id='cancer-resources' resourceGroups={[CANCER_RESOURCES]} />
      </article>
    </section>
  )
}

export default CancerLink
